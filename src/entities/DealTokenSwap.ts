import { IDealDiscussion } from "entities/DealDiscussions";
import { formatBytes32String } from "ethers/lib/utils";
import { Address, Hash } from "./../services/EthereumService";
import { DealStatus, IDeal, IDealTokenSwapDocument, IVoteInfo, IDealDAOVotingSummary } from "entities/IDealTypes";
import { IDataSourceDeals, IDealIdType } from "services/DataSourceDealsTypes";
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

// interface ITokenSwapInfo {
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
//   executionDate: BigNumber; // trying to get them to switch to uint type
//   // hash of the deal information.
//   metadata: string;
//   // status of the deal
//   status: number; // 3 ("DONE") means the deal has been executed
// }

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
  amount: BigNumber;
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
  private dealDocument: IDealTokenSwapDocument;

  public id: IDealIdType;
  public dealInitialized: boolean;
  public totalPrice?: number;
  public initializing = true;
  public corrupt = false;

  /**
   * the id used by the TokenSwapModule contract to identify this this.  Is
   * generated when funding is initiated by the Proposal Lead, and obtained
   * from the resulting TokenSwapModule.TokenSwapCreated event.
   */
  public contractDealId: number;

  public moduleContract: any;
  public daoDepositContracts: Map<IDAO, any>;
  public dealManager: any;

  public primaryDao: IDAO;
  public partnerDao: IDAO;
  public createdAt: Date;
  /**
   * isExecuted and executedAt are both detected by the presence of an TokenSwapModule.TokenSwapExecuted event
   * for this deal. They are initialized by DealService when this entity is created.
   */
  public isExecuted = false;
  public executedAt: Date;

  public daoTokenTransactions: Map<IDAO, Array<IDaoTransaction>>;

  @computedFrom("dealDocument.registrationData")
  public get registrationData(): IDealRegistrationTokenSwap {
    return this.dealDocument.registrationData;
  }

  @computedFrom("registrationData.isPrivate")
  public get isPrivate(): boolean {
    return this.registrationData.isPrivate;
  }
  /**
   * Open Proposal that is open for offers, by bizdev definition
   * @returns
   */
  @computedFrom("isOpenProposal", "isWithdrawn")
  public get isActive(): boolean {
    return this.isOpenProposal && !this.isWithdrawn;
  }

  @computedFrom("isPartnered", "majorityHasVoted")
  public get isApproved(): boolean {
    return this.isPartnered && this.majorityHasVoted;
  }

  @computedFrom("isPartnered", "fundingWasInitiated", "isRejected")
  public get isVoting(): boolean {
    return this.isPartnered && !this.fundingWasInitiated && !this.isRejected;
  }

  @computedFrom("dealDocument.isWithdrawn")
  public get isWithdrawn(): boolean {
    return this.dealDocument.isWithdrawn;
  }

  public set isWithdrawn(newValue: boolean) {
    this.dealDocument.isWithdrawn = newValue;
  }

  @computedFrom("dealDocument.isRejected")
  public get isRejected(): boolean {
    return this.dealDocument.isRejected;
  }

  public set isRejected(newValue: boolean) {
    this.dealDocument.isRejected = newValue;
  }

  // public get isTargetReached(): boolean {
  //   return;
  // }

  @computedFrom("isExecuted", "executedAt", "fundingPeriod")
  get timeLeftToExecute(): number | undefined {
    if (!this.isExecuted) {
      return;
    }
    return (this.executedAt.getTime() + this.fundingPeriod * 1000) - Date.now();
  }

  /**
   * Same as isVoting, by bizdev definition
   * @returns
   */
  @computedFrom("isVoting")
  public get isNegotiating(): boolean {
    return this.isVoting;
  }

  @computedFrom("contractDealId")
  public get fundingWasInitiated(): boolean {
    return !!this.contractDealId;
  }

  /**
   * in seconds, duration from execution to expired
   */
  @computedFrom("registrationData.fundingPeriod")
  public get fundingPeriod(): number {
    return this.registrationData.fundingPeriod;
  }

  @computedFrom("isExecuted", "executedAt", "fundingPeriod")
  public get fundingPeriodHasExpired(): boolean {
    const now = Date.now();
    return this.isExecuted ?
      (now > (this.executedAt.valueOf() + (this.fundingPeriod * 1000))) : false;
  }

  @computedFrom("fundingPeriodHasExpired")
  public get isFailed() {
    return this.fundingPeriodHasExpired && !this.isExecuted;
  }

  @computedFrom("fundingWasInitiated", "isExecuted", "fundingPeriodHasExpired")
  public get isFunding(): boolean {
    return this.fundingWasInitiated && !this.isExecuted && !this.fundingPeriodHasExpired;
  }

  @computedFrom("isSwapping")
  public get isClaiming(): boolean {
    return this.isSwapping;
  }

  @computedFrom("isExecuted")
  public get isSwapping(): boolean {
    return this.isExecuted;
  }

  // TODO need to code whether there is anything left to claim

  /**
   * same as isClaiming/isExecuted, by bizdev definition
   */
  @computedFrom("isClaiming")
  public get isCompleted(): boolean {
    return this.isClaiming;
  }

  /**
   * withdrawn or rejected
   * @returns
   */
  @computedFrom("isWithdrawn", "isRejected")
  public get isCancelled(): boolean {
    return this.isWithdrawn || this.isRejected;
  }

  @computedFrom("registrationData.primaryDAO.representatives")
  public get primaryRepresentatives(): Array<IRepresentative> {
    return this.registrationData.primaryDAO.representatives;
  }

  @computedFrom("registrationData.partnerDAO.representatives")
  public get partnerRepresentatives(): Array<IRepresentative> {
    return this.registrationData.partnerDAO.representatives;
  }

  @computedFrom("registrationData.primaryDAO.representatives", "registrationData.partnerDAO.representatives")
  public get allRepresentatives(): Array<IRepresentative> {
    return this.registrationData.primaryDAO.representatives.concat(this.registrationData.partnerDAO?.representatives ?? []);
  }

  @computedFrom("dealDocument.votingSummary.totalSubmitted", "dealDocument.votingSummary.totalSubmittable")
  public get majorityHasVoted(): boolean {
    return this.dealDocument.votingSummary.totalSubmitted > (this.dealDocument.votingSummary.totalSubmittable / 2);
  }

  // TODO: observe the right things here to recompute when votes have changed
  @computedFrom("dealDocument.votingSummary.primaryDAO.votes", "dealDocument.votingSummary.partnerDAO.votes")
  public get allVotes(): Array<IVoteInfo> {
    return this.dealDocument.votingSummary.primaryDAO.votes.concat(this.dealDocument.votingSummary.partnerDAO?.votes ?? []);
  }

  @computedFrom("isActive", "isCompleted", "fundingPeriodHasExpired", "isCancelled", "isNegotiating", "isFunding", "isSwapping")
  public get status(): DealStatus {
    if (this.isActive) { return DealStatus.active; }
    else if (this.isCompleted) { return DealStatus.completed; }
    else if (this.fundingPeriodHasExpired) { return DealStatus.failed; }
    else if (this.isCancelled) { return DealStatus.cancelled; }
    else if (this.isNegotiating) { return DealStatus.negotiating; }
    else if (this.isFunding) { return DealStatus.funding; }
    else if (this.isSwapping) { return DealStatus.swapping; }
    // else if (this.isTargetReached) { return DealStatus.targetReached; }
    // else if (!this.isTargetReached) { return DealStatus.targetNotReached; }
  }

  /**
   * key is the clauseId, value is the discussion key
   */
  public clauseDiscussions: Map<string, IDealDiscussion>;

  @computedFrom("registrationData.partnerDAO")
  public get isOpenProposal(): boolean {
    return !this.registrationData.partnerDAO;
  }

  @computedFrom("registrationData.partnerDAO")
  public get isPartnered(): boolean {
    return !!this.registrationData.partnerDAO;
  }

  public create(dealDoc: IDealTokenSwapDocument): DealTokenSwap {
    this.initializedPromise = Utils.waitUntilTrue(() => !this.initializing, 9999999999);
    this.dealDocument = dealDoc;
    this.id = dealDoc.id;
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
      this.dealManager = await this.contractsService.getContractFor(ContractNames.DEALMANAGER);
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

      daoDepositContracts.set(this.primaryDao,
        this.contractsService.getContractAtAddress(
          ContractNames.DAODEPOSITMANAGER,
          await this.dealManager.daoDepositManager(this.registrationData.primaryDAO.treasury_address)));

      if (this.registrationData.partnerDAO) {
        daoDepositContracts.set(this.partnerDao,
          this.contractsService.getContractAtAddress(
            ContractNames.DAODEPOSITMANAGER,
            await this.dealManager.daoDepositManager(this.registrationData.partnerDAO.treasury_address)));
      }

      this.daoDepositContracts = daoDepositContracts;
    }
  }

  private async hydrate(): Promise<void> {
    // eslint-disable-next-line no-empty
    try {
      this.primaryDao = this.registrationData.primaryDAO;
      this.partnerDao = this.registrationData.partnerDAO;
      this.createdAt = new Date(this.dealDocument.createdAt);

      await this.loadDepositContracts(); // now that we have registrationData
      this.clauseDiscussions = this.dealDocument.clauseDiscussions ? new Map(Object.entries(this.dealDocument.clauseDiscussions)) : new Map();

      this.contractDealId = await this.moduleContract.metadataToDealId(formatBytes32String(this.id));

      await this.hydrateDaoTransactions();
    }
    catch (error) {
      this.corrupt = true;
      this.consoleLogService.logMessage(`Deal: Error initializing deal ${error?.message}`, "error");
    } finally {
      this.initializing = false;
    }
  }

  private async hydrateDaoTransactions(): Promise<void> {
    if (!this.daoTokenTransactions) {
      this.daoTokenTransactions = new Map<IDAO, Array<IDaoTransaction>>();
    }

    const daoTokenTransactions = new Map<IDAO, Array<IDaoTransaction>>();

    daoTokenTransactions.set(this.primaryDao, await this.getDaoTransactions(this.primaryDao));
    if (this.partnerDao) {
      daoTokenTransactions.set(this.partnerDao, await this.getDaoTransactions(this.partnerDao));
    }

    this.daoTokenTransactions = daoTokenTransactions;
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

  public addClauseDiscussion(discussionId: string, discussion: IDealDiscussion): Promise<void> {
    return this.dataSourceDeals.addClauseDiscussion(
      this.id,
      this.ethereumService.defaultAccountAddress,
      discussionId,
      discussion,
    ).then(() => {
      this.clauseDiscussions.set(discussionId, discussion);
    });
  }

  public async loadDealSize(): Promise<void> {
    // if the total price is already figured out we don't need to try again
    if (this.totalPrice) {
      return;
    }

    try {
      const dealTokens = this.primaryDao.tokens.concat(this.partnerDao?.tokens ?? []);
      const clonedTokens = dealTokens.map(tokenDetails => Object.assign({}, tokenDetails));
      const tokensDetails = Utils.uniqBy(clonedTokens, "symbol");

      await this.tokenService.getTokenPrices(tokensDetails);

      this.totalPrice = dealTokens.reduce((sum, item) => {
        const tokenDetails: ITokenInfo | undefined = tokensDetails.find(tokenPrice => tokenPrice.symbol === item.symbol);
        return sum + (tokenDetails?.price ?? 0) * Number(item.amount);
      }, 0);
    } catch {
      this.totalPrice = 0;
    }
  }

  /**
   * Enters the funding stage
   * @returns
   */
  public createSwap(): Promise<TransactionReceipt> {
    const daoAddresses = [
      this.primaryDao.treasury_address,
      this.partnerDao.treasury_address,
    ];
    const { tokens, pathTo, pathFrom } = this.constructDealCreateParameters();
    const metadata = formatBytes32String(this.id);
    const deadline = this.fundingPeriod;

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

  private async getDaoTransactions(dao: IDAO): Promise<Array<IDaoTransaction>> {
    const transactions = new Array<IDaoTransaction>();
    const depositContract = this.daoDepositContracts.get(dao);

    const depositFilter = depositContract.filters.Deposited();
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
            amount: params.amount,
          });
        }
      });

    const withdrawFilter = depositContract.filters.Withdrawn();
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
            amount: params.amount,
          });
        }
      });

    return transactions;
  }

  public close(): Promise<void> {
    if (this.isOpenProposal) {
      return this.withdraw();
    } else {
      return this.reject();
    }
  }

  public withdraw(): Promise<void> {
    if (!this.isWithdrawn) {
      return this.dataSourceDeals.updateDealIsWithdrawn(this.id, this.ethereumService.defaultAccountAddress, true)
        .then(() => {
          this.isWithdrawn = true;
        });
    }
  }

  public reject(): Promise<void> {
    if (!this.isRejected) {
      return this.dataSourceDeals.updateDealIsRejected(this.id, this.ethereumService.defaultAccountAddress, true)
        .then(() => {
          this.isRejected = true;
        });
    }
  }

  public vote(upDown: boolean, whichDao: IDAO): Promise<void> {

    const daoVotingSummary = this.daoVotingSummary(whichDao);

    const daoVotes = this.votesArrayToMap(daoVotingSummary.votes);

    if (upDown !== daoVotes.get(this.ethereumService.defaultAccountAddress)) {
      return this.dataSourceDeals.updateVote(
        this.id,
        this.ethereumService.defaultAccountAddress,
        whichDao === this.primaryDao ? "PRIMARY_DAO" : "PARTNER_DAO",
        upDown);
    }
  }

  private daoVotingSummary(whichDao: IDAO): IDealDAOVotingSummary {
    return whichDao === this.primaryDao ?
      this.dealDocument.votingSummary.primaryDAO :
      this.dealDocument.votingSummary.partnerDAO;
  }

  private votesArrayToMap(votes: Array<IVoteInfo>): Map<Address, boolean> {
    return new Map<Address, boolean>(votes.map((voteInfo) => [ voteInfo.address, voteInfo.vote]));
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
