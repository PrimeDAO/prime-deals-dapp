import { SortOrder, SortService } from "services/SortService";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Address, EthereumService, Networks } from "./EthereumService";
import { autoinject, computedFrom, Container } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { EventAggregator } from "aurelia-event-aggregator";
import { AureliaHelperService } from "./AureliaHelperService";
import { ConsoleLogService } from "./ConsoleLogService";
import { IDataSourceDeals, IDealIdType } from "services/DataSourceDealsTypes";
import { ContractNames, ContractsService, IStandardEvent } from "services/ContractsService";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { EventConfigException } from "services/GeneralEvents";
import { Utils } from "services/utils";

// interface ITokenSwapCreatedArgs {
//   module: Address,
//   dealId: number;
//   // the participating DAOs
//   daos: Array<Address>;
//   // the tokens involved in the swap
//   tokens: Array<Address>;
//   // the token flow from the DAOs to the module
//   pathFrom: Array<Array<BigNumber>>;
//   // the token flow from the module to the DAO
//   pathTo: Array<Array<BigNumber>>;
//   // unix timestamp of the deadline
//   deadline: BigNumber; // trying to get them to switch to uint type
//   // unix timestamp of the execution
//   // executionDate: BigNumber; // trying to get them to switch to uint type
//   // hash of the deal information.
//   metadata: string;
//   // status of the deal
//   status: number; // 3 ("DONE") means the deal has been executed
// }

interface ITokenSwapExecutedArgs {
  module: Address,
  dealId: number;
}

interface IExecutedDeal {
  executedAt: Date;
}

export let StartingBlockNumber: number;

@autoinject
export class DealService {

  /**
   * key is a deal Id
   */
  public deals: Map<IDealIdType, DealTokenSwap> = new Map<IDealIdType, DealTokenSwap>();
  private executedDealIds: Map<string, IExecutedDeal>;

  @computedFrom("deals.size")
  public get dealsArray(): Array<DealTokenSwap> {
    return this.deals ? Array.from(this.deals.values())
      // sort in descending createdAt date order
      .sort((a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateDateTimeAsDate(a.createdAt, b.createdAt, SortOrder.DESC)) : [];
  }

  public initializing = true;

  @computedFrom("dealsArray.length")
  public get openProposals(): Array<any> {
    return this.dealsArray.filter((deal: DealTokenSwap) => deal.isOpenProposal );
  }

  @computedFrom("dealsArray.length")
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
  }

  public async initialize(): Promise<void> {
    this.eventAggregator.subscribe("Network.Changed.Account", async (): Promise<void> => {
      this.eventAggregator.publish("deals.loading", true);
      this.getDeals(true).finally(() => this.eventAggregator.publish("deals.loading", false));
    });
    /**
     * deals will take care of themselves on account changes
     */
    this.getDeals();
  }

  private async getDeals(force = false): Promise<void> {

    this.initializing = true;

    return this.getDealInfo().then(() => {
      return this.dataSourceDeals.getDeals<IDealTokenSwapDocument>(this.ethereumService.defaultAccountAddress).then((dealDocs) => {
        if (force || !this.deals?.size) {
          if (!dealDocs) {
            throw new Error("Deals are not accessible");
          }
          const dealsMap = new Map<Address, DealTokenSwap>();

          // const dealDocs = await this.dataSourceDeals.getDeals<IDealTokenSwapDocument>(this.ethereumService.defaultAccountAddress);

          for (const dealDoc of dealDocs) {
            this._createDeal(dealDoc, dealsMap);
          }
          this.deals = dealsMap;
        }
      });
    })
      .catch((error) => {
        this.deals = new Map();
        // this.eventAggregator.publish("handleException", new EventConfigException("Sorry, an error occurred", error));
        this.eventAggregator.publish("handleException", new EventConfigException("An error occurred loading deals", error));
      })
      .finally(() => this.initializing = false);
  }

  private async getDealInfo(): Promise<Map<string, IExecutedDeal>> {
    // commented-out until we have working contract code for retrieving the metadata
    const moduleContract = await this.contractsService.getContractFor(ContractNames.TOKENSWAPMODULE);
    const filter = moduleContract.filters.TokenSwapExecuted();
    const dealIds = new Map<string, IExecutedDeal>();

    await moduleContract.queryFilter(filter, StartingBlockNumber)
      .then(async (events: Array<IStandardEvent<ITokenSwapExecutedArgs>>): Promise<void> => {
        for (const event of events) {
          const params = event.args;
          const dealId = (await moduleContract.tokenSwaps(params.dealId)).metadata;
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
    return Utils.waitUntilTrue(() => !this.initializing, 999999);
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
    /**
     * this should automatically be true because firestorm automatically does this filtering,
     * but we have to handle the case where this is a new deal being added by wizard submission.
     */
    if (!deal.isPrivate || deal.isRepresentativeUser || deal.isUserProposalLead) {
      if (!dealsMap) {
        dealsMap = this.deals;
      }
      dealsMap.set(deal.id, deal);
    }
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
