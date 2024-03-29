import { skip } from "rxjs/operators";
import { SortOrder, SortService } from "services/SortService";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Address, EthereumService, IBlockInfoNative, IEthereumService, Networks } from "./EthereumService";
import { inject, IContainer, IEventAggregator, PLATFORM} from "aurelia";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { AureliaHelperService } from "./AureliaHelperService";
import { ConsoleLogService } from "./ConsoleLogService";
import { IDataSourceDeals, IDealIdType } from "services/DataSourceDealsTypes";
import { ContractNames, ContractsService, IStandardEvent } from "services/ContractsService";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { EventConfigException } from "services/GeneralEvents";
import { Subscription } from "rxjs";
import { Utils } from "services/utils";
import { parseBytes32String } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { toBigNumberJs } from "services/BigNumberService";
import * as applyDiff from "services/ApplyDiffService";

interface ITokenSwapCreatedArgs {
  module: Address,
  dealId: number;
  // unix timestamp of the execution
  // executionDate: BigNumber; // trying to get them to switch to uint type
  // hash of the deal information.
  metadata: string;
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
}

interface ITokenSwapExecutedArgs {
  module: Address,
  dealId: number;
  metadata: string;
}

interface IExecutedDeal {
  executedAt: Date;
}

interface IFundedDeal {
  fundedAt: Date;
}

/**
 * the block in which the TokenSwapModule contract was created
 */
export let StartingBlockNumber: number;

@inject()
export class DealService {

  /**
   * key is a deal Id
   */
  public deals: Map<IDealIdType, DealTokenSwap> = new Map<IDealIdType, DealTokenSwap>();
  private executedDealIds: Map<string, IExecutedDeal> = new Map();
  private fundedDealIds: Map<string, IFundedDeal> = new Map();

  public static getDealFee(amount: BigNumber): BigNumber {
    return BigNumber.from(toBigNumberJs(amount).multipliedBy(.003).toString());
  }

  public get dealsArray(): Array<DealTokenSwap> {
    return this.deals ? Array.from(this.deals.values())
      // sort in descending createdAt date order
      .sort((a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateDateTimeAsDate(a.createdAt, b.createdAt, SortOrder.DESC)) : [];
  }

  public initializing = true;

  /**
   * used to store the subscription to the deals and unsubscribe on account change
   */
  private dealsSubscription: Subscription;

  public get openProposals(): Array<any> {
    return this.dealsArray.filter((deal: DealTokenSwap) => deal.isOpenProposal );
  }

  public get partneredDeals(): Array<any> {
    return this.dealsArray.filter((deal: DealTokenSwap) => deal.isPartnered );
  }

  // public dealsObject: any = {};
  // public DAOs: Array<IDaoAPIObject>;

  constructor(
    @IDataSourceDeals private dataSourceDeals: IDataSourceDeals,
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IContainer private container: IContainer,
    private aureliaHelperService: AureliaHelperService,
    private contractsService: ContractsService,
    private consoleLogService: ConsoleLogService,
    @IEthereumService private ethereumService: IEthereumService,
  ) {
    /**
     * set to the block of the creation of the TokenSwapModule
     */
    switch (EthereumService.targetedNetwork) {
      case Networks.Mainnet:
        StartingBlockNumber = 14706002;
        break;
      case Networks.Rinkeby:
        StartingBlockNumber = 10578516;
        break;
      default:
        StartingBlockNumber = 0;
        break;
    }
  }

  /**
   * Best to invoke this after the very first wallet has been connected as the app is loading
   * and before anyone else subscribes to Network.Changed.Account.
   * We want to be the first, so others can ideally have up-to-date deals
   * when they handle a new account.
   */
  public async initialize(): Promise<void> {
    this.dataSourceDeals.initialize();
    this.eventAggregator.subscribe("Network.Changed.Account", async (): Promise<void> => {
      if (this.initializing) {
        /**
         * queue up to handle reentrancy
         */
        PLATFORM.taskQueue.queueTask(async () =>
        {
          /**
           * wait until the previous load is done
           */
          await this.ensureInitialized();
          return this.loadDeals();
        });
      } else {
        /**
         * get this started ASAP ideally before other subscribers to Network.Changed.Account
         */
        this.loadDeals();
      }
    });

    await Promise.all([this.getDealExecuted(), this.getDealFundedInfo()]);
    return this.loadDeals();
  }

  public async loadDeals(): Promise<void> {
    // compute the message here - are we going to ask for the signature??
    // add that method (to figure out if we are going to request signature) to dataSourceDeals
    const message = this.dataSourceDeals.isUserSignatureRequired(this.ethereumService.defaultAccountAddress) ?
      "Check your wallet provider to ensure it is not waiting for your signature." :
      "Thank you for your patience while we initialize for a few moments...";

    this.eventAggregator.publish("deals.loading", {onOff: true, message});
    await this.getDeals().finally(() => this.eventAggregator.publish("deals.loading", {onOff: false}));
    return this.observeDeals();
  }

  private async getDeals(): Promise<void> {
    if (this.dealsSubscription) {
      this.dealsSubscription.unsubscribe();
    }

    this.initializing = true;

    await this.dataSourceDeals.syncAuthentication(this.ethereumService.defaultAccountAddress);

    return this.dataSourceDeals.getDeals<IDealTokenSwapDocument>(this.ethereumService.defaultAccountAddress)
      .then((dealDocs) => {
        if (!dealDocs) {
          throw new Error("Deals are not accessible");
        }

        if (!this.deals) {
          this.deals = new Map<Address, DealTokenSwap>();
        }

        /**
           * add what we don't already have
           */
        for (const dealDoc of dealDocs) {
          if (!this.deals.has(dealDoc.id)) {
            this._createDeal(dealDoc);
          }
        }
        /**
           * delete what we shouldn't have
           */
        const newDealIds = new Set(dealDocs.map(dealDoc => dealDoc.id));
        this.deals.forEach((_value, key) => {
          if (!newDealIds.has(key)) {
            this.deals.delete(key);
          }
        });
      })
      .catch((error) => {
        this.deals = new Map();
        this.eventAggregator.publish("handleException", new EventConfigException("An error occurred loading deals", error));
      })
      .finally(() => this.initializing = false);
  }

  private async getDealExecuted(): Promise<Array<void>> {
    const moduleContract = await this.contractsService.getContractFor(ContractNames.TOKENSWAPMODULE);
    const filter = moduleContract.filters.TokenSwapExecuted();
    this.executedDealIds = new Map<string, IExecutedDeal>();
    const promises = new Array<Promise<void>>();

    /**
     * We start observing right away to avoid missing any blocks
     */
    this.observeDealExecuted();

    await moduleContract.queryFilter(filter, StartingBlockNumber)
      .then(async (events: Array<IStandardEvent<ITokenSwapExecutedArgs>>): Promise<void> => {
        for (const event of events) {
          const params = event.args;
          const dealId = parseBytes32String(params.metadata);
          promises.push(event.getBlock()
            .then((block: IBlockInfoNative) => {
              this.executedDealIds.set(dealId, { executedAt: new Date(block.timestamp * 1000) });
            }));
        }});

    return Promise.all(promises);
  }

  private async observeDealExecuted(): Promise<void> {
    const moduleContract = await this.contractsService.getContractFor(ContractNames.TOKENSWAPMODULE);
    const filter = moduleContract.filters.TokenSwapExecuted();

    await moduleContract.on(filter, async (_module: Address, contractDealId: number, metadata: string) => {
      const dealId = parseBytes32String(metadata);
      const executedAt = new Date(this.ethereumService.lastBlock.timestamp * 1000);
      this.executedDealIds.set(dealId, { executedAt });

      const deal = this.deals.get(dealId);
      deal.isExecuted = true;
      deal.executedAt = executedAt;
    });

  }

  private async getDealFundedInfo(): Promise<Array<void>> {
    const moduleContract = await this.contractsService.getContractFor(ContractNames.TOKENSWAPMODULE);
    const filter = moduleContract.filters.TokenSwapCreated();
    this.fundedDealIds = new Map<string, IFundedDeal>();
    const promises = new Array<Promise<void>>();

    /**
     * We start observing right away to avoid missing any blocks
     */
    this.observeDealFundedInfo();

    await moduleContract.queryFilter(filter, StartingBlockNumber)
      .then(async (events: Array<IStandardEvent<ITokenSwapCreatedArgs>>): Promise<void> => {
        for (const event of events) {
          const params = event.args;
          const dealId = parseBytes32String(params.metadata);
          promises.push(event.getBlock()
            .then((block: IBlockInfoNative) => {
              this.fundedDealIds.set(dealId, { fundedAt: new Date(block.timestamp * 1000) });
            }));
        }});

    return Promise.all(promises);
  }

  private async observeDealFundedInfo(): Promise<void> {
    const moduleContract = await this.contractsService.getContractFor(ContractNames.TOKENSWAPMODULE);
    const filter = moduleContract.filters.TokenSwapCreated();

    moduleContract.on(filter, async (_module: Address, contractDealId: number, metadata: string) => {
      const dealId = parseBytes32String(metadata);
      const fundedAt = new Date(this.ethereumService.lastBlock.timestamp * 1000);
      this.fundedDealIds.set(dealId, { fundedAt });

      const deal = this.deals.get(dealId);
      deal.fundingStartedAt = fundedAt;
      deal.contractDealId = contractDealId;
    });
  }

  private async observeDeals(): Promise<void> {
    if (this.dealsSubscription) {
      this.dealsSubscription.unsubscribe();
    }

    this.dealsSubscription = this.dataSourceDeals.allDealsUpdatesObservable().pipe(skip(1)).subscribe(
      /**
       * Pawel => confirm whether the `updates` array will ever contain more than one item,
       * and if so, when.
       *
       * Use of microtasks is an attempt to aggregate changes prior to Aurelia's
       * handling of them, hoping this will be the cleanest and most correct
       * presentation of the changes to the app that is observing Deal data.
       *
       * Consider this case:  Suppose we have Deal A and B, in a single callback having
       * two updates, A is removed from the deals map, B is added to the deals map.
       * Elsewhere some code C is observing deals.size, will this appear as two changes or none?
       * The net effect on deal.size is 0.  Will code C pick up any change?
       *
       * Reggardless, anyone can easily observe changes to the collection set using
       * `aureliaHelperService.createCollectionWatch(this.dealService.deals, ...)`
       *
       */
      updates => {
        updates.forEach(update => {
          this.dataSourceDeals.getDealById(update.dealId).then(dealDoc => {
            if (dealDoc) {
              if (this.deals.has(dealDoc.id)) {
                this.updateDealDocument(this.deals.get(dealDoc.id).dealDocument, dealDoc);
              } else {
                /**
                 * This should only happen when a deal is created in another browser instance.
                 * It will create new deal entity asynchronously, once created it will be part of dealsMap
                 */
                this._createDeal(dealDoc);
              }
            } else {
              PLATFORM.taskQueue.queueTask(() => {
                this.deals.delete(update.dealId);
              });
            }
          });
        });
      },
    );
  }

  private createDealFromDoc(dealDoc: IDealTokenSwapDocument): DealTokenSwap {
    const deal = this.container.get(DealTokenSwap);

    const executedDeal = this.executedDealIds.get(dealDoc.id);
    if (executedDeal) {
      deal.isExecuted = true;
      deal.executedAt = executedDeal.executedAt;
    }

    const fundedDeal = this.fundedDealIds.get(dealDoc.id);
    if (fundedDeal) {
      deal.fundingStartedAt = fundedDeal.fundedAt;
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

  /**
   * Updates only parts of dealDocument that were updated
   */
  private updateDealDocument(dealDocument: IDealTokenSwapDocument, updatedDocument: IDealTokenSwapDocument):void {

    PLATFORM.taskQueue.queueTask(() => {
      // ignore updates to modifiedAt property
      updatedDocument.modifiedAt = dealDocument.modifiedAt;

      /**
       * if partnerDAO is undefined set it to undefined on the updated document
       * because it doesn't exist on the updated document and that would trigger an update
       */
      if (dealDocument.registrationData.partnerDAO === undefined) {
        updatedDocument.registrationData.partnerDAO = undefined;
      }

      /**
       * applies any structural differences from the updatedDocument to the dealDocument
       * and doesn't modified properties that didn't change
       * it is granular and works with updating changes to nested objects (including objects inside arrays)
       */
      // @ts-ignore (to ignore TS2349)
      applyDiff(dealDocument, updatedDocument);
    });
  }
}
