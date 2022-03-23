import { Address, EthereumService, Hash, Networks } from "./EthereumService";
import { autoinject, computedFrom, Container } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { EventAggregator } from "aurelia-event-aggregator";
import { AureliaHelperService } from "./AureliaHelperService";
import { ConsoleLogService } from "./ConsoleLogService";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";
import { ContractNames, ContractsService, IStandardEvent } from "services/ContractsService";
import { BigNumber } from "ethers";
import { parseBytes32String } from "ethers/lib/utils";

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

// export interface IDaoAPIObject {
//   daoName: string,
//   organizationId: string,
//   daoId: string,
//   logo: string,
//   daosArr: Array<IDaoPartner>,
//   totalNumMembers: number,
//   totalNumProposals: number,
//   totalNumVoters: number,
//   totalValueUSD: number,
//   totalInUSD: number,
//   totalOutUSD: number,
//   votersParticipation: number,
//   thumbName: string,
//   platform: number,
// }

export let StartingBlockNumber: number;

@autoinject
export class DealService {

  /**
   * key is a ceramic Hash
   */
  public deals: Map<IKey, DealTokenSwap>;

  @computedFrom("deals.size")
  public get dealsArray(): Array<DealTokenSwap> {
    return this.deals ? Array.from(this.deals.values()) : [];
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
    private dataSourceDeals: IDataSourceDeals,
    private eventAggregator: EventAggregator,
    private container: Container,
    private aureliaHelperService: AureliaHelperService,
    private contractsService: ContractsService,
    private consoleLogService: ConsoleLogService,
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

  }

  public async initialize(): Promise<void> {
    /**
     * deals will take care of themselves on account changes
     */
    this.getDeals();
  }

  private async getDeals(): Promise<void> {

    return this.initializedPromise = new Promise(
      (resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: any) => void): void => {
        this.getExecutedDealInfo().then((executedDealIds) => {
          if (!this.deals?.size) {
            try {

              const dealsMap = new Map<Address, DealTokenSwap>();

              /**
             * rootId is just some way of identifying where in Ceramic to search for this list of Deal ids.
             */
              const dealIds = this.dataSourceDeals.get<Array<string>>("root_stream_id");

              for (const dealId of dealIds) {
                const deal = this.createDealFromConfig(dealId);

                const executedDeal = executedDealIds.get(dealId);
                if (executedDeal) { // should only happen for test data
                  deal.isExecuted = true;
                  deal.executedAt = executedDeal.executedAt;
                }

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

    return dealIds;
  }

  private createDealFromConfig(dealId: Hash): DealTokenSwap {
    const deal = this.container.get(DealTokenSwap);
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
}
