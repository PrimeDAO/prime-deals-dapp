import { IDealDiscussion } from "entities/DealDiscussions";
import { formatBytes32String } from "ethers/lib/utils";
import { Address, fromWei, Hash } from "./../services/EthereumService";
import { DealStatus, IDeal, IDealDAOVotingSummary, IDealTokenSwapDocument, IVotesInfo } from "entities/IDealTypes";
import { IDataSourceDeals, IDealIdType } from "services/DataSourceDealsTypes";
import { ITokenInfo, TokenService } from "services/TokenService";

import { ConsoleLogService } from "services/ConsoleLogService";
import { DisposableCollection } from "services/DisposableCollection";
import { EthereumService } from "services/EthereumService";
import { IDAO, IDealRegistrationTokenSwap, IToken } from "entities/DealRegistrationTokenSwap";
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

interface IClaimedEventArgs {
  dealModule: Address;
  dealId: string;
  dao: Address;
  token: Address;
  claimed: BigNumber;
}

interface IDaoClaim {
  dealId: string;
  dao: IDAO;
  token: IToken;
  claimedAmount: BigNumber;
  createdAt: Date; //transaction date
  txid: Hash; //transaction id,
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
  amount: BigNumber,
  withdrawnAt?: Date,
  withdrawTxId?: Hash,
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

  public primaryDao?: IDAO;
  public partnerDao: IDAO;
  public createdAt: Date;
  /**
   * isExecuted and executedAt are both detected by the presence of an TokenSwapModule.TokenSwapExecuted event
   * for this deal. They are initialized by DealService when this entity is created.
   */
  public isExecuted = false;
  public executedAt: Date;

  public daoTokenTransactions: Map<IDAO, Array<IDaoTransaction>>;
  public daoTokenClaims: Map<IDAO, Array<IDaoClaim>>;

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

  @computedFrom("daoTokenTransactions")
  public get isTargetReached(): boolean {
    if (!this.daoTokenTransactions) return false;
    let isReached = true;
    this.daoTokenTransactions.forEach((transactions, dao) => { //loop through each dao
      if (!isReached) return; //immediately returns if it's already false from a previous loop
      isReached = dao.tokens.every(daoToken => {
        const totalDeposited : BigNumber = transactions.reduce((a, b) => b.type === "deposit" ? a.add(b.amount) : a.sub(b.amount), BigNumber.from(0));
        return totalDeposited.gte(daoToken.amount);
      });
    });
    return isReached;
  }

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

  /**
   * Gets the DAO in which the current account is a representative (if they are at all)
   */
  @computedFrom("ethereumService.defaultAccountAddress", "partnerDaoRepresentatives", "primaryDaoRepresentatives", "registrationData.primaryDAO", "registrationData.partnerDAO")
  public get daoRepresentedByCurrentAccount(): IDAO {
    return this.getDao(true);
  }

  /**
   * Gets the other DAO from the one in which the current account is a representative (if they are at all)
     */
  @computedFrom("ethereumService.defaultAccountAddress", "partnerDaoRepresentatives", "primaryDaoRepresentatives", "registrationData.primaryDAO", "registrationData.partnerDAO")
  public get daoOtherThanRepresentedByCurrentAccount(): IDAO {
    return this.getDao(false);
  }

  /**
   * Gets the DAO based on the connected account
   * @param relatedToAccount
   * @returns IDAO
   * This will return the DAO either related to the account or not related to the account depending on what the caller needs.
   * This method will look at the connected account and compare it to all the representative addresses in each of the DAOs to return which DAO is/isn't related based on the bool passed to it
   * EX. If I want to get the DAO that is not related to the connected account I would call this.getDao(false)
   * EX. If I want to get the DAO that is related to the connected account I would call this.getDao(true)
   */
  private getDao(relatedToAccount: boolean) : IDAO | null {
    if (this.partnerDaoRepresentatives.has(this.ethereumService.defaultAccountAddress)){
      //the connected account is a representative of the partner DAO
      return relatedToAccount ? this.registrationData.partnerDAO : this.registrationData.primaryDAO;
    }
    if (this.primaryDaoRepresentatives.has(this.ethereumService.defaultAccountAddress)){
      //the connceted account is either a representative of the primary DAO or the proposal lead
      return relatedToAccount ? this.registrationData.primaryDAO : this.registrationData.partnerDAO;
    }
    return null;
  }

  /**
   * same as isClaiming/isExecuted, by bizdev definition
   */
  @computedFrom("isClaiming")
  public get isCompleted(): boolean {
    return this.isClaiming;
  }

  @computedFrom("isExecuted")
  public get isClaiming(): boolean {
    return this.isExecuted;
  }

  // TODO need to code whether there is anything left to claim

  /**
   * withdrawn or rejected
   * @returns
   */
  @computedFrom("isWithdrawn", "isRejected")
  public get isCancelled(): boolean {
    return this.isWithdrawn || this.isRejected;
  }

  @computedFrom("dealDocument.votingSummary.totalSubmitted", "dealDocument.votingSummary.totalSubmittable")
  public get majorityHasVoted(): boolean {
    return this.dealDocument.votingSummary.totalSubmitted > (this.dealDocument.votingSummary.totalSubmittable / 2);
  }

  // TODO: observe the right things here to recompute when votes have changed
  @computedFrom("dealDocument.votingSummary.primaryDAO.votes", "dealDocument.votingSummary.partnerDAO.votes")
  public get allVotes(): IVotesInfo {
    return {
      ...this.dealDocument.votingSummary.primaryDAO.votes,
      ...this.dealDocument.votingSummary.partnerDAO.votes,
    };
  }

  @computedFrom("dealDocument.votingSummary.primaryDAO.votes")
  public get primaryDaoVotes(): IVotesInfo {
    return this.dealDocument.votingSummary.primaryDAO.votes;
  }

  @computedFrom("dealDocument.votingSummary.partnerDAO.votes")
  public get partnerDaoVotes(): IVotesInfo {
    return this.dealDocument.votingSummary.partnerDAO?.votes ?? {};
  }

  @computedFrom("allVotes")
  public get submittedVotes(): (boolean | null)[] {
    return Object.values(this.allVotes).filter(vote => vote !== null);
  }

  public representativeVote(representativeAddress: Address = this.ethereumService.defaultAccountAddress): boolean | null {
    return this.allVotes[representativeAddress];
  }

  public get hasRepresentativeVoted(): boolean {
    return this.representativeVote() !== null;
  }

  @computedFrom("majorityHasVoted", "hasUserVoted")
  public get isRepresentativeEligibleToVote(): boolean {
    return !this.majorityHasVoted && !this.hasRepresentativeVoted;
  }

  @computedFrom("majorityHasVoted", "hasUserVoted", "isUserProposalLead")
  public get isProposalLeadWaitingForOthersToVote() {
    return !this.majorityHasVoted && this.isUserProposalLead && (this.hasRepresentativeVoted || !this.isRepresentativeUser);
  }

  @computedFrom("majorityHasVoted", "hasUserVoted", "isUserProposalLead")
  public get isRepresentativeWaitingForOthersToVote(): boolean {
    return !this.majorityHasVoted && !this.isUserProposalLead && this.hasRepresentativeVoted;
  }

  @computedFrom("isApproved", "isUserProposalLead")
  public get canStartFunding() {
    return this.isApproved && this.isUserProposalLead;
  }

  @computedFrom("isApproved", "isUserProposalLead")
  public get waitingForTheProposalLeadToStartFunding() {
    return this.isApproved && !this.isUserProposalLead;
  }

  @computedFrom("isActive", "isCompleted", "fundingPeriodHasExpired", "isCancelled", "isNegotiating", "isFunding", "isClaiming")
  public get status(): DealStatus {
    if (this.isActive) { return DealStatus.active; }
    else if (this.fundingPeriodHasExpired) { return DealStatus.failed; }
    else if (this.isCancelled) { return DealStatus.cancelled; }
    else if (this.isNegotiating) { return DealStatus.negotiating; }
    else if (this.isFunding) { return DealStatus.funding; }
    else if (this.isCompleted) { return DealStatus.completed; }
    // else if (this.isClaiming) { return DealStatus.claiming; }
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

  @computedFrom("ethereumService.defaultAccountAddress", "representativesAndLead")
  public get isUserRepresentativeOrLead(): boolean {
    return this.representativesAndLead.has(this.ethereumService.defaultAccountAddress);
  }

  @computedFrom("ethereumService.defaultAccountAddress", "registrationData.proposalLead.address")
  public get isUserProposalLead(): boolean {
    return this.registrationData.proposalLead?.address === this.ethereumService.defaultAccountAddress;
  }

  @computedFrom("ethereumService.defaultAccountAddress", "representatives")
  public get isRepresentativeUser(): boolean {
    return this.representatives.has(this.ethereumService.defaultAccountAddress);
  }

  @computedFrom("primaryDaoRepresentatives", "partnerDaoRepresentatives")
  public get representatives(): Set<Address> {
    return Utils.unionSet(this.primaryDaoRepresentatives, this.partnerDaoRepresentatives);
  }

  @computedFrom("registrationData.proposalLead.address", "representatives")
  public get representativesAndLead(): Set<Address> {
    const reps = new Set(this.representatives);
    return reps.add(this.registrationData.proposalLead?.address);
  }

  @computedFrom("registrationData.primaryDAO.representatives")
  public get primaryDaoRepresentatives(): Set<Address> {
    return new Set(this.registrationData.primaryDAO?.representatives.map(representative => representative.address) ?? []);
  }

  @computedFrom("registrationData.partnerDAO.representatives")
  public get partnerDaoRepresentatives(): Set<Address> {
    return new Set(this.registrationData.partnerDAO?.representatives.map(representative => representative.address) ?? []);
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

      await Promise.all([
        this.hydrateDaoTransactions(),
        this.hydrateDaoClaims(),
      ]);
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

  private async hydrateDaoClaims(): Promise<void> {
    if (!this.daoTokenClaims) {
      this.daoTokenClaims = new Map<IDAO, Array<IDaoClaim>>();
    }

    const daoTokenClaims = new Map<IDAO, Array<IDaoClaim>>();

    daoTokenClaims.set(this.primaryDao, await this.getDaoClaims(this.primaryDao));
    if (this.partnerDao) {
      daoTokenClaims.set(this.partnerDao, await this.getDaoClaims(this.partnerDao));
    }

    this.daoTokenClaims = daoTokenClaims;
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
      const dealTokens = this.primaryDao?.tokens.concat(this.partnerDao?.tokens ?? []) ?? [];
      const clonedTokens = dealTokens.map(tokenDetails => Object.assign({}, tokenDetails));
      const tokensDetails = Utils.uniqBy(clonedTokens, "symbol");

      await this.tokenService.getTokenPrices(tokensDetails);

      this.totalPrice = dealTokens.reduce((sum, item) => {
        const tokenDetails: ITokenInfo | undefined = tokensDetails.find(tokenPrice => tokenPrice.symbol === item.symbol);
        return sum + (tokenDetails?.price ?? 0) * (Number(fromWei(item.amount, item.decimals) ?? 0));
      }, 0);
    } catch (error){
      throw new Error(`Computing deal price ${error}`);
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
      .then(receipt => {
        if (receipt) {
          this.hydrate();
          return receipt;
        }
      });
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

  public claim(dao: IDAO): Promise<TransactionReceipt> {
    return this.transactionsService.send(
      () => this.daoDepositContracts.get(dao).claimDealVestings(this.moduleContract.address, this.contractDealId)
        .then(receipt => {
          if (receipt) {
            this.hydrateDaoClaims();
            return receipt;
          }
        }));
  }

  public vote(upDown: boolean): Promise<void> {
    const whichDao = this.daoRepresentedByCurrentAccount;

    if (!whichDao) {
      throw new Error("Vote: Current account is not related to the ");
    }

    const daoVotingSummary = this.daoVotingSummary(whichDao);

    if (upDown !== daoVotingSummary.votes[this.ethereumService.defaultAccountAddress]) {
      return this.dataSourceDeals.updateVote(
        this.id,
        this.ethereumService.defaultAccountAddress,
        whichDao === this.primaryDao ? "PRIMARY_DAO" : "PARTNER_DAO",
        upDown);
    }
  }
  private getTokenInfoFromDao(tokenAddress: Address, dao: IDAO): IToken {
    tokenAddress = tokenAddress.toLowerCase();
    return dao.tokens.find((token: IToken) => token.address.toLowerCase() === tokenAddress );
  }

  private daoVotingSummary(whichDao: IDAO): IDealDAOVotingSummary {
    return whichDao === this.primaryDao ?
      this.dealDocument.votingSummary.primaryDAO :
      this.dealDocument.votingSummary.partnerDAO;
  }

  private async getDaoClaims(dao: IDAO): Promise<Array<IDaoClaim>> {
    const claims = new Array<IDaoClaim>();
    const depositContract = this.daoDepositContracts.get(dao);

    const depositFilter = depositContract.filters.VestingClaimed(
      this.moduleContract.address,
      this.contractDealId,
      dao.treasury_address);

    await depositContract.queryFilter(depositFilter)
      .then(async (events: Array<IStandardEvent<IClaimedEventArgs>>): Promise<void> => {
        for (const event of events) {
          const params = event.args;
          claims.push({
            dao: dao,
            token: this.getTokenInfoFromDao(params.token, dao),
            createdAt: new Date((await event.getBlock()).timestamp * 1000),
            txid: event.transactionHash,
            dealId: params.dealId,
            claimedAmount: params.claimed,
          });
        }
      });

    return claims;
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
            token: this.getTokenInfoFromDao(params.token, dao),
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
            token: this.getTokenInfoFromDao(params.token, dao),
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
