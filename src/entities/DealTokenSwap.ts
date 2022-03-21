import { formatBytes32String } from "ethers/lib/utils";
import { Address, Hash } from "./../services/EthereumService";
import { DealStatus, IDeal, IDealsData } from "entities/IDealTypes";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";
import { ITokenInfo, TokenService } from "services/TokenService";

import { ConsoleLogService } from "services/ConsoleLogService";
import { DisposableCollection } from "services/DisposableCollection";
import { EthereumService } from "services/EthereumService";
import { IDAO, IDealRegistrationTokenSwap, IRepresentative, IToken } from "entities/DealRegistrationTokenSwap";
import { Utils } from "services/utils";
import { autoinject, computedFrom } from "aurelia-framework";
import { ContractNames, ContractsService, IStandardEvent } from "services/ContractsService";
import { EventAggregator } from "aurelia-event-aggregator";
import { BigNumber } from "ethers";
import TransactionsService, { TransactionReceipt } from "services/TransactionsService";

interface ITokenSwapInfo {
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
  executionDate: BigNumber; // trying to get them to switch to uint type
  // hash of the deal information.
  metadata: string;
  // status of the deal
  status: number; // 3 ("DONE") means the deal has been executed
}

interface IDepositEventArgs {
  module: Address;
  dealId: number;
  depositId: number;
  depositor: Address;
  token: Address;
  amount: BigNumber;
}

export type DealTransactionType = "deposit" | "withdraw";

export interface IDaoTransaction {
  dao: IDAO, //dao that this transaction is related to in registration data
  type: DealTransactionType, // deposit or withdraw
  token: IToken, //only need iconURI, amount and symbol
  address: string, //from/to address
  createdAt: Date, //transaction date
  txid: Hash, //transaction id,
  depositId: number,
}

@autoinject
export class DealTokenSwap implements IDeal {

  constructor(
    private consoleLogService: ConsoleLogService,
    private ethereumService: EthereumService,
    private dataSourceDeals: IDataSourceDeals,
    private tokenService: TokenService,
    private contractsService: ContractsService,
    private transactionsService: TransactionsService,
    eventAggregator: EventAggregator,
  ) {
    this.subscriptions.push(eventAggregator.subscribe("Contracts.Changed", async () => {
      await this.loadContracts();
    }));
  }

  private initializedPromise: Promise<void>;
  private subscriptions = new DisposableCollection();
  private rootData: IDealsData;

  public id: IKey;
  public dealInitialized: boolean;
  public totalPrice?: number;
  public initializing = true;
  public corrupt = false;

  public registrationData: IDealRegistrationTokenSwap;
  /**
   * the id used by the TokenSwapModule contract to identify this this.  Is
   * generated when funding is initiated by the Proposal Lead, and obtained
   * from the resulting TokenSwapModule.TokenSwapCreated event.
   */
  public contractDealId: number;

  public moduleContract: any;
  public daoDepositContracts: Map<IDAO, any>;
  public baseContract: any;

  public primaryDao: IDAO;
  public partnerDao: IDAO;

  /**
   * is detected by the presence of an TokenSwapModule.TokenSwapExecuted event for this deal
   */
  public isExecuted = false;
  /**
   * in seconds, duration from execution to expired
   */
  public executionPeriod: number;
  public executedAt: Date;
  /**
   * stored in the doc
   */
  public isWithdrawn: boolean;
  /**
   * stored in the doc.
   */
  public isRejected: boolean;

  // public get fundingPeriodDuration(): number {
  //   return this.registrationData.
  // }

  //   public get inFundingPeriod(): boolean {
  //   return this.tokenSwapCreated && ;
  // }

  /**
   * Open Proposal that is open for offers, by bizdev definition
   * @returns
   */
  public get isActive(): boolean {
    return this.isOpenProposal && !this.isWithdrawn;
  }

  public get isApproved(): boolean {
    return this.isPartnered && this.majorityHasVoted;
  }

  public get isVoting(): boolean {
    return this.isPartnered && !this.fundingWasInitiated && !this.isRejected;
  }

  /**
   * Same as isVoting, by bizdev definition
   * @returns
   */
  public get isNegotiating(): boolean {
    return this.isVoting;
  }

  public get fundingWasInitiated(): boolean {
    return !!this.contractDealId;
  }

  @computedFrom("executedAt", "executionPeriod")
  public get fundingPeriodHasExpired(): boolean {
    const now = Date.now();
    return this.isExecuted ?
      (now > (this.executedAt.valueOf() + (this.executionPeriod * 1000))) : false;
  }

  public get isFailed() {
    return this.fundingPeriodHasExpired;
  }

  public get isFunding(): boolean {
    return this.fundingWasInitiated && !this.isExecuted && !this.fundingPeriodHasExpired;
  }

  /**
   * poor naming of this status by bizdev because it is being defined to
   * actually be the funding period when swapping (claiming) isn't actually occurring.
   */
  public get isSwapping(): boolean {
    return this.isFunding;
  }

  public get isClaiming(): boolean {
    return this.isExecuted;
  }

  /**
   * same as isClaiming, by bizdev definition
   */
  public get isCompleted(): boolean {
    return this.isClaiming;
  }

  /**
   * withdrawn or rejected
   * @returns
   */
  public get isClosed(): boolean {
    return this.isWithdrawn || this.isRejected;
  }

  // public get isTargetReached(): boolean {
  //   return;
  // }

  public get primaryRepresentatives(): Array<IRepresentative> {
    return this.registrationData.partnerDAO.representatives;
  }

  public get partnerRepresentatives(): Array<IRepresentative> {
    return this.registrationData.partnerDAO.representatives;
  }

  public get allRepresentatives(): Array<IRepresentative> {
    return this.registrationData.primaryDAO.representatives.concat(this.registrationData.partnerDAO.representatives);
  }

  public get majorityHasVoted(): boolean {
    return;
    //return this.votes?.length > (this.allRepresentatives.length / 2);
  }

  public get status(): DealStatus {
    if (this.isActive) { return DealStatus.active; }
    else if (this.isCompleted) { return DealStatus.completed; }
    else if (this.fundingPeriodHasExpired) { return DealStatus.failed; }
    else if (this.isClosed) { return DealStatus.closed; }
    else if (this.isNegotiating) { return DealStatus.negotiating; }
    else if (this.isFunding) { return DealStatus.funding; }
    else if (this.isSwapping) { return DealStatus.swapping; }
    // else if (this.isTargetReached) { return DealStatus.targetReached; }
    // else if (!this.isTargetReached) { return DealStatus.targetNotReached; }
  }

  // public get votes(): Array<IVoteInfo> {
  //   return this.rootData.votes;
  // }

  /**
   * key is the clauseId, value is the discussion key
   */
  public clauseDiscussions: Map<string, string>;

  public get isOpenProposal(): boolean {
    return !this.registrationData.partnerDAO;
  }

  public get isPartnered(): boolean {
    return !!this.registrationData.partnerDAO;
  }

  public create(id: IKey): DealTokenSwap {
    this.initializedPromise = Utils.waitUntilTrue(() => !this.initializing, 9999999999);
    this.id = id;
    return this;
  }

  /**
   * note this is called when the contracts change
   * @param config
   * @returns
   */
  public async initialize(): Promise<void> {
    this.initializing = true;
    await this.loadContracts();
    /**
       * no, intentionally don't await
       */
    this.hydrate();
  }

  private async loadContracts(): Promise<void> {
    try {
      this.moduleContract = await this.contractsService.getContractFor(ContractNames.TOKENSWAPMODULE);
      this.baseContract = await this.contractsService.getContractFor(ContractNames.BASECONTRACT);
      return this.loadDepositContracts();
    }
    catch (error) {
      this.corrupt = true;
      this.initializing = false;
      this.consoleLogService.logMessage(`DealTokenSwap: Error initializing deal ${error?.message}`, "error");
    }
  }

  private async loadDepositContracts(): Promise<void> {
    if (this.registrationData) {

      const daoDepositContracts = new Map<IDAO, any>();

      daoDepositContracts.set(this.primaryDao, await this.baseContract.depositContract(this.registrationData.primaryDAO.treasury_address));
      if (this.registrationData.partnerDAO) {
        daoDepositContracts.set(this.partnerDao, await this.baseContract.depositContract(this.registrationData.partnerDAO.treasury_address));
      }

      this.daoDepositContracts = daoDepositContracts;
    }
  }

  private async hydrate(): Promise<void> {
    // eslint-disable-next-line no-empty
    try {
      this.rootData = await this.dataSourceDeals.get<IDealsData>(this.id);
      this.registrationData = await this.dataSourceDeals.get<IDealRegistrationTokenSwap>(this.rootData.registration);

      this.primaryDao = this.registrationData.primaryDAO;
      this.partnerDao = this.registrationData.partnerDAO;
      this.executionPeriod = this.registrationData.executionPeriodInDays * 86400;

      await this.loadDepositContracts(); // now that we have registrationData
      const discussionsMap = await this.dataSourceDeals.get<Record<string, string> | undefined>(this.rootData.discussions);
      this.clauseDiscussions = new Map(Object.entries(discussionsMap ?? {}));

      // TODO:
      // const metadata = Utils.asciiToHex(this.id); // should be same as tokenSwapInfo.metadata
      // this.contractDealId = await this.moduleContract.metadataToId(metadata);
      // const tokenSwapInfo: TokenSwapInfo = await this.moduleContract.tokenSwaps(this.contractDealId);
      // this.isExecuted = tokenSwapInfo.status === 3;
      this.isExecuted = this.isWithdrawn = this.isRejected = false;
    }
    catch (error) {
      this.corrupt = true;
      this.consoleLogService.logMessage(`Deal: Error initializing deal ${error?.message}`, "error");
    } finally {
      this.initializing = false;
    }
  }

  private async hydrateUser(): Promise<void> {
    const account = this.ethereumService.defaultAccountAddress;

    if (account) {
      // TODO- Is it necessary?
    }
  }

  public ensureInitialized(): Promise<void> {
    return this.initializedPromise;
  }

  public updateRegistration(registration: IDealRegistrationTokenSwap): Promise<void> {
    return this.dataSourceDeals.update(this.id, JSON.stringify(registration));
  }

  public addClauseDiscussion(clauseId: string, discussionKey: string): Promise<void> {
    this.clauseDiscussions.set(clauseId, discussionKey);
    const clauseDiscussionsObject = Object.fromEntries(this.clauseDiscussions);
    return this.dataSourceDeals.update(discussionKey, JSON.stringify(clauseDiscussionsObject)); // TODO check if this line works correctly
  }

  public async loadDealSize(): Promise<void> {
    // if the total price is already figured out we don't need to try again
    if (this.totalPrice === undefined) {
      try {
        let total = 0;
        const allTokens = [...(this.registrationData.partnerDAO?.tokens ?? []), ...(this.registrationData.primaryDAO?.tokens ?? [])];
        const tokens: Array<ITokenInfo> = allTokens.map(x => ({
          address: x.address,
          decimals: x.decimals,
          logoURI: x.logoURI,
          id: "",
          name: x.name,
          symbol: x.symbol,
        }));
        await this.tokenService.getTokenPrices(tokens);
        allTokens.forEach(x => {
          const currentToken = tokens.find(y => y.symbol === x.symbol);
          total += (currentToken?.price ?? 0) * Number(x.amount ?? 0);
        });
        this.totalPrice = total;
      } catch { this.totalPrice = 0; }
    }
  }

  public createSwap(): Promise<TransactionReceipt> {
    const daoAddresses = [
      this.primaryDao.treasury_address,
      this.partnerDao.treasury_address,
    ];
    const { tokens, pathTo, pathFrom } = this.constructDealCreateParameters();
    const metadata = formatBytes32String(this.id);
    const deadline = this.executionPeriod;

    const dealParameters = [
      daoAddresses,
      tokens,
      pathFrom,
      pathTo,
      metadata,
      deadline,
    ];

    return this.transactionsService.send(
      () => this.moduleContract.createSwap(...dealParameters))
      .then(async receipt => {
        if (receipt) {
          this.hydrate();
          return receipt;
        }
      });
  }

  public getTokenInfoFromAddress(tokenAddress: Address, dao: IDAO): IToken {
    tokenAddress = tokenAddress.toLowerCase();
    return dao.tokens.find((token: IToken) => token.address.toLowerCase() === tokenAddress );
  }

  public async getDaoTransactions(dao: IDAO): Promise<Array<IDaoTransaction>> {
    const transactions = new Array<IDaoTransaction>();
    const depositContract = this.daoDepositContracts.get(dao);

    const depositFilter = depositContract.filters.Deposit();
    await depositContract.queryFilter(depositFilter)
      .then(async (events: Array<IStandardEvent<IDepositEventArgs>>): Promise<void> => {
        for (const event of events) {
          const params = event.args;
          transactions.push({
            type: "deposit",
            dao: dao,
            token: this.getTokenInfoFromAddress(params.token, dao),
            address: params.depositor,
            createdAt: new Date((await event.getBlock()).timestamp * 1000),
            txid: event.transactionHash,
            depositId: params.depositId,
          });
        }
      });

    const withdrawFilter = depositContract.filters.Withdraw();
    await depositContract.queryFilter(withdrawFilter)
      .then(async (events: Array<IStandardEvent<IDepositEventArgs>>): Promise<void> => {
        for (const event of events) {
          const params = event.args;
          transactions.push({
            type: "withdraw",
            dao: dao,
            token: this.getTokenInfoFromAddress(params.token, dao),
            address: params.depositor,
            createdAt: new Date((await event.getBlock()).timestamp * 1000),
            txid: event.transactionHash,
            depositId: params.depositId,
          });
        }
      });

    return transactions;
  }

  /**
   * pulled from deal-contracts
   * @returns
   */
  private constructDealCreateParameters(): { tokens: Array<unknown>, pathTo: Array<unknown>, pathFrom: Array<unknown> } {
    const tokens = new Array<unknown>();
    const pathTo = new Array<unknown>();
    const pathFrom = new Array<unknown>();
    const zero = 0;
    const fourZeros = [0, 0, 0, 0];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.primaryDao.tokens.length; i++) {
      if (!tokens.includes(this.primaryDao.tokens[i].address)) {
        tokens.push(this.primaryDao.tokens[i].address);
        pathFrom.push([this.primaryDao.tokens[i].amount, zero]);
        pathTo.push([
          ...fourZeros,
          this.primaryDao.tokens[i].instantTransferAmount,
          this.primaryDao.tokens[i].vestedTransferAmount,
          this.primaryDao.tokens[i].cliffOf,
          this.primaryDao.tokens[i].vestedFor,
        ]);
      }
    }
    for (let i = 0; i < this.partnerDao.tokens.length; i++) {
      if (!tokens.includes(this.partnerDao.tokens[i].address)) {
        tokens.push(this.partnerDao.tokens[i].address);
        pathFrom.push([zero, this.partnerDao.tokens[i].amount]);
        pathTo.push([
          this.primaryDao.tokens[i].instantTransferAmount,
          this.primaryDao.tokens[i].vestedTransferAmount,
          this.primaryDao.tokens[i].cliffOf,
          this.primaryDao.tokens[i].vestedFor,
          ...fourZeros,
        ]);
      }
    }
    return { tokens, pathTo, pathFrom };
  }
}
