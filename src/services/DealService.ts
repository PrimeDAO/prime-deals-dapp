import axios from "axios";
import { Address, Hash } from "./EthereumService";
import { autoinject, computedFrom, Container } from "aurelia-framework";
import { IDealConfig } from "../registry-wizard/dealConfig";
import { Deal } from "entities/Deal";
import { IDataSourceDeals } from "../services/IDataSource";
import { EventAggregator } from "aurelia-event-aggregator";
import { AureliaHelperService } from "./AureliaHelperService";
import { ConsoleLogService } from "./ConsoleLogService";
import { CeramicServiceMock } from "./CeramicServiceMock";

export interface IDaoPartner {
  daoId: string,
  organizationId: string,
  title: string,
  logo: string,
  totalNumMembers: number
  totalNumProposals: number
  totalNumVoters: number
  totalValueUSD: number
  totalInUSD: number
  totalOutUSD: number
  votersParticipation: number
  name: string,
  platform: string,
  thumbName: string
}

export interface IDaoAPIObject {
  daoName: string,
  organizationId: string,
  daoId: string,
  logo: string,
  daosArr: Array<IDaoPartner>,
  totalNumMembers: number,
  totalNumProposals: number,
  totalNumVoters: number,
  totalValueUSD: number,
  totalInUSD: number,
  totalOutUSD: number,
  votersParticipation: number,
  thumbName: string,
  platform: number,
}

@autoinject
export class DealService {

  /**
   * key is a ceramic Hash
   */
  public deals: Map<Hash, Deal>;
  @computedFrom("seeds.size")
  public get dealsArray(): Array<Deal> {
    return this.deals ? Array.from(this.deals.values()) : [];
  }
  public initializing = true;
  private initializedPromise: Promise<void>;

  public get openDeals(): Array<any> {
    return this.dealsArray.filter((deal: Deal) => deal.isOpen );
  }

  public get partneredDeals(): Array<any> {
    return this.dealsArray.filter((deal: Deal) => deal.isPartnered );
  }

  // public dealsObject: any = {};
  public DAOs: Array<IDaoAPIObject>;

  constructor(
    private dataSourceDeals: CeramicServiceMock,
    private eventAggregator: EventAggregator,
    private container: Container,
    private aureliaHelperService: AureliaHelperService,
    private consoleLogService: ConsoleLogService,
  ) {
  }

  public async initialize(): Promise<void> {
    /**
     * deals will take care of themselves on account changes
     */
    this.getDeals();
    this.getDAOsInformation();
  }

  private async getDeals(): Promise<void> {
    return this.initializedPromise = new Promise(
      (resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: any) => void): void => {
        if (!this.deals?.size) {
          try {
            const dealsMap = new Map<Address, Deal>();

            /**
             * rootId is just some way of identifying where in Ceramic to search for this list of Deal ids.
             */
            const dealIds = this.dataSourceDeals.get<Array<string>>("root_stream_id");

            for (const dealId of dealIds) {
              const deal = this.createSeedFromConfig(dealId);
              dealsMap.set(dealId, deal);
              /**
               * remove the deal if it is corrupt
               */
              this.aureliaHelperService.createPropertyWatch(deal, "corrupt", (newValue: boolean) => {
                if (newValue) { // pretty much the only case
                  this.deals.delete(deal.id);
                }
              });
              this.consoleLogService.logMessage(`instantiated deal: ${deal.id}`, "info");
              deal.initialize(); // set this off asyncronously.
            }
            this.deals = dealsMap;
            this.initializing = false;
            resolve();
          }
          catch (error) {
            this.deals = new Map();
            // this.eventAggregator.publish("handleException", new EventConfigException("Sorry, an error occurred", error));
            this.eventAggregator.publish("handleException", new Error("Sorry, an error occurred"));
            this.initializing = false;
            reject();
          }
        }
      },
    );
  }

  private createSeedFromConfig(dealId: Hash): Deal {
    const deal = this.container.get(Deal);
    return deal.create(dealId);
  }

  public ensureInitialized(): Promise<void> {
    return this.initializedPromise;
  }

  public async ensureAllDealsInitialized(): Promise<void> {
    await this.ensureInitialized();
    for (const deal of this.dealsArray) {
      await deal.ensureInitialized();
    }
  }

  public async createRegistration(registration: IDealConfig): Promise<void> {
    this.dataSourceDeals.save("key", registration);
  }

  /**
   * has to be able to update individual parts of the registration or any other data (votes, discussions)
   */
  public async updateDealRegistration(registration: IDealConfig): Promise<void> {
    this.dataSourceDeals.save("key", registration);
  }

  /**
   * TODO: move this to a `DaosService`
   */
  public async getDAOsInformation(): Promise<void> {
    // TODO
    const allDAOs = await(await axios.get("https://backend.deepdao.io/dashboard/ksdf3ksa-937slj3/")).data.daosSummary;

    this.DAOs = allDAOs.map((dao: IDaoAPIObject) => ({
      organizationId: dao.organizationId,
      daoId: dao.daoId,
      name: dao.daoName,
      logo: (dao.logo)
        ? (dao.logo.toLocaleLowerCase().startsWith("http"))
          ? dao.logo
          : `https://deepdao-uploads.s3.us-east-2.amazonaws.com/assets/dao/logo/${dao.logo}`
        : "https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png?w=35",
    }));
  }

  public async getDAOByOrganisationID(id: string): Promise<IDaoAPIObject> {
    if (!this.DAOs) await this.getDAOsInformation;

    const dao: IDaoAPIObject = this.DAOs.filter(dao => dao.organizationId === id)[0];
    return dao;
  }

  private asciiToHex(str = ""): string {
    const res = [];
    const { length: len } = str;
    for (let n = 0, l = len; n < l; n++) {
      const hex = Number(str.charCodeAt(n)).toString(16);
      res.push(hex);
    }
    return `0x${res.join("")}`;
  }
}
