import { SortOrder, SortService } from "services/SortService";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Address, EthereumService, Networks } from "./EthereumService";
import { autoinject, computedFrom, Container } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { EventAggregator } from "aurelia-event-aggregator";
import { AureliaHelperService } from "./AureliaHelperService";
import { ConsoleLogService } from "./ConsoleLogService";
import { IDataSourceDeals2, IKey } from "services/DataSourceDealsTypes";
import { ContractNames, ContractsService, IStandardEvent } from "services/ContractsService";
import { BigNumber } from "ethers";
import { parseBytes32String } from "ethers/lib/utils";
import { IDealTokenSwapDocument } from "entities/IDealTypes";

interface ITokenSwapCreatedArgs {
  module: Address,
  dealId: number; // trying to get them to switch to uint type
  // the participating DAOs
  daos: Array<Address>;
  // the tokens involved in the swap
  tokens: Array<Address>;
  // the token flow from the DAOs to the module
  pathFrom: Array<Array<BigNumber>>;
  // the token flow from the module to the DAO
  pathTo: Array<Array<BigNumber>>;
  // unix timestamp of the deadline
  deadline: BigNumber; // trying to get them to switch to uint type
  // unix timestamp of the execution
  // executionDate: BigNumber; // trying to get them to switch to uint type
  // hash of the deal information.
  metadata: string;
  // status of the deal
  status: number; // 3 ("DONE") means the deal has been executed
}

interface IExecutedDeal {
  executedAt: Date;
}

export let StartingBlockNumber: number;

@autoinject
export class DealService {

  /**
   * key is a ceramic Hash
   */
  public deals: Map<IKey, DealTokenSwap>;
  private executedDealIds: Map<string, IExecutedDeal>;

  @computedFrom("deals.size")
  public get dealsArray(): Array<DealTokenSwap> {
    return this.deals ? Array.from(this.deals.values())
      // sort in descending createdAt date order
      .sort((a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateDateTimeAsDate(a.createdAt, b.createdAt, SortOrder.DESC)) : [];
  }

  public initializing = true;
  private initializedPromise: Promise<void>;

  public get openProposals(): Array<any> {
    return this.dealsArray.filter((deal: DealTokenSwap) => deal.isOpenProposal );
  }

  public get partneredDeals(): Array<any> {
    return this.dealsArray.filter((deal: DealTokenSwap) => deal.isPartnered );
  }

  // public dealsObject: any = {};
  // public DAOs: Array<IDaoAPIObject>;

  constructor(
    private dataSourceDeals: IDataSourceDeals2,
    private eventAggregator: EventAggregator,
    private container: Container,
    private aureliaHelperService: AureliaHelperService,
    private contractsService: ContractsService,
    private consoleLogService: ConsoleLogService,
    private ethereumService: EthereumService,
  ) {
    switch (EthereumService.targetedNetwork) {
      case Networks.Mainnet:
        StartingBlockNumber = 0;
        break;
      case Networks.Rinkeby:
        StartingBlockNumber = 10376393;
        break;
      default:
        StartingBlockNumber = 0;
        break;
    }
    this.eventAggregator.subscribe("Network.Changed.Account", async (): Promise<void> => {
      if (!this.initializing) {
        try {
          this.eventAggregator.publish("deals.loading", true);
          await this.getDeals(true);
        } finally {
          this.eventAggregator.publish("deals.loading", false);
        }
      }
    });
  }

  public async initialize(): Promise<void> {
    /**
     * deals will take care of themselves on account changes
     */
    this.getDeals();
  }

  private async getDeals(force = false): Promise<void> {

    this.initializing = true;

    return this.initializedPromise = new Promise(
      (resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: any) => void): void => {
        this.getExecutedDealInfo().then(() => {
          this.dataSourceDeals.getDeals<IDealTokenSwapDocument>(this.ethereumService.defaultAccountAddress).then((dealDocs) => {
            if (force || !this.deals?.size) {
              try {

                if (!dealDocs) {
                  throw new Error("Deals are not accessible");
                }
                const dealsMap = new Map<Address, DealTokenSwap>();

                // const dealDocs = await this.dataSourceDeals.getDeals<IDealTokenSwapDocument>(this.ethereumService.defaultAccountAddress);

                for (const dealDoc of dealDocs) {
                  this._createDeal(dealDoc, dealsMap);
                }
                this.deals = dealsMap;
                resolve();
              }
              catch (error) {
                this.deals = new Map();
                // this.eventAggregator.publish("handleException", new EventConfigException("Sorry, an error occurred", error));
                this.eventAggregator.publish("handleException", error);
                reject();
              }
              finally {
                this.initializing = false;
              }
            }
          });
        });
      });
  }

  private async getExecutedDealInfo(): Promise<Map<string, IExecutedDeal>> {
    // commented-out until we have working contract code for retrieving the metadata
    const moduleContract = await this.contractsService.getContractFor(ContractNames.TOKENSWAPMODULE);
    const filter = moduleContract.filters.TokenSwapCreated();
    const dealIds = new Map<string, IExecutedDeal>();

    await moduleContract.queryFilter(filter, StartingBlockNumber)
      .then(async (events: Array<IStandardEvent<ITokenSwapCreatedArgs>>): Promise<void> => {
        for (const event of events) {
          const params = event.args;
          const dealId = parseBytes32String(params.metadata);
          dealIds.set(dealId, { executedAt: new Date((await event.getBlock()).timestamp * 1000) });
        }
      });

    // TODO figure out how to gkeep this up-to-date
    this.executedDealIds = dealIds;
    return dealIds;
  }

  private createDealFromDoc(dealDoc: IDealTokenSwapDocument): DealTokenSwap {
    const deal = this.container.get(DealTokenSwap);

    const executedDeal = this.executedDealIds.get(dealDoc.id);
    if (executedDeal) { // should only happen for test data
      deal.isExecuted = true;
      deal.executedAt = executedDeal.executedAt;
    }

    return deal.create(dealDoc);
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

  public async createDeal(registrationData: IDealRegistrationTokenSwap): Promise<DealTokenSwap> {
    const dealDoc = await this.dataSourceDeals.createDeal(this.ethereumService.defaultAccountAddress, registrationData);
    return this._createDeal(dealDoc);
  }

  public async updateRegistration(dealId: string, registrationData: IDealRegistrationTokenSwap): Promise<void> {
    return this.dataSourceDeals.updateRegistration(
      dealId,
      this.ethereumService.defaultAccountAddress,
      registrationData);
  }

  private _createDeal(
    dealDoc: IDealTokenSwapDocument,
    dealsMap?: Map<Address, DealTokenSwap>,
  ): DealTokenSwap {
    const deal = this.createDealFromDoc(dealDoc);

    if (!dealsMap) {
      dealsMap = this.deals;
    }

    dealsMap.set(deal.id, deal);
    /**
     * remove the deal if it is corrupt
     */
    this.aureliaHelperService.createPropertyWatch(deal, "corrupt", (newValue: boolean) => {
      if (newValue) { // pretty much the only case
        this.deals.delete(deal.id); // yes, this.deals
      }
    });
    this.consoleLogService.logMessage(`instantiated deal: ${deal.id}`, "info");
    deal.initialize(); // asynchronous
    return deal;
  }
}
