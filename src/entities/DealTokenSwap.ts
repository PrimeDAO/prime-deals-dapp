import { IDealDiscussion } from "entities/DealDiscussions";
import { formatBytes32String } from "ethers/lib/utils";
import { Address, fromWei, Hash } from "./../services/EthereumService";
import { DealStatus, IDeal, IDealDAOVotingSummary, IDealTokenSwapDocument, IVotesInfo } from "entities/IDealTypes";
import { IDataSourceDeals, IDealIdType } from "services/DataSourceDealsTypes";
import { ITokenInfo, TokenService } from "services/TokenService";

import { ConsoleLogService } from "services/ConsoleLogService";
import { EthereumService } from "services/EthereumService";
import { IDAO, IDealRegistrationTokenSwap, IProposalLead, IToken } from "entities/DealRegistrationTokenSwap";
import { Utils } from "services/utils";
import { autoinject, computedFrom } from "aurelia-framework";
import { ContractNames, ContractsService, IStandardEvent } from "services/ContractsService";
import { EventAggregator } from "aurelia-event-aggregator";
import { BigNumber } from "ethers";
import TransactionsService, { TransactionReceipt } from "services/TransactionsService";
import { NumberService } from "services/NumberService";
import { toBigNumberJs } from "services/BigNumberService";
import { AureliaHelperService } from "../services/AureliaHelperService";

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

export interface ITokenCalculated extends IToken {
  fundingDeposited?: BigNumber,
  fundingRequired?: BigNumber,
  fundingPercentCompleted?: number,
  claimingClaimable?: BigNumber,
  claimingClaimed?: BigNumber,
  claimingLocked?: BigNumber,
  claimingPercentCompleted?: number,
}

@autoinject
export class DealTokenSwap implements IDeal {

  public partnerDao?: IDAO;

  private initializedPromise: Promise<void>;
  private now: Date;

  public id: IDealIdType;
  public dealInitialized: boolean;
  public totalPrice?: number;
  public initializing = true;
  public corrupt = false;
  /**
   * Attention: Even though, this is public, we try to minimizedirect usage.
   * If possible try to create wrapper properties.
   */
  public dealDocument: IDealTokenSwapDocument;

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

  constructor(
    private consoleLogService: ConsoleLogService,
    private ethereumService: EthereumService,
    private dataSourceDeals: IDataSourceDeals,
    private tokenService: TokenService,
    private contractsService: ContractsService,
    private transactionsService: TransactionsService,
    private numberService: NumberService,
    private aureliaHelperService: AureliaHelperService,
    eventAggregator: EventAggregator,
  ) {
    eventAggregator.subscribe("Contracts.Changed", async () => {
      await this.loadContracts();
    });
    eventAggregator.subscribe("secondPassed", (params: { _blockDate, now: Date }) => {
      this.now = params.now;
    });
  }

  public createdAt: Date;
  /**
   * isExecuted and executedAt are both detected by the presence of an TokenSwapModule.TokenSwapExecuted event
   * for this deal. They are initialized by DealService when this entity is created.
   */
  public isExecuted = false;
  public executedAt: Date;
  /**
   * fundingStartedAt is detected by the presence of an TokenSwapModule.TokenSwapCreated event
   * for this deal. It is initialized by DealService when this entity is created.
   */
  public fundingStartedAt: Date;

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

  public set isPrivate(value: boolean) {
    this.registrationData.isPrivate = value;
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

  /**
   * An Open Proposal can be withdrawn by the proposal lead
   */
  @computedFrom("dealDocument.isWithdrawn")
  public get isWithdrawn(): boolean {
    return this.dealDocument.isWithdrawn;
  }

  public set isWithdrawn(newValue: boolean) {
    this.dealDocument.isWithdrawn = newValue;
  }

  /**
   * At any time until a partnered deal has been approved,
   * the proposal lead can deliberately choose to reject a partnered deal
   */
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
        const tokenTransactions = transactions.filter(x => x.token.address === daoToken.address); //filter transactions by token
        const totalDeposited : BigNumber = tokenTransactions.reduce((a, b) => b.type === "deposit" ? a.add(b.amount) : a.sub(b.amount), BigNumber.from(0));
        return totalDeposited.gte(daoToken.amount);
      });
    });
    return isReached;
  }

  @computedFrom("daoTokenClaims")
  public get isFullyClaimed(): boolean {
    let returnVal = false;
    if (this.isClaiming && this.daoTokenClaims){
      let isClaimed = true;
      this.daoTokenClaims.forEach((claims, dao) => { //loop through each dao
        if (!isClaimed) return; //immediately returns if it's already false from a previous loop
        isClaimed = dao.tokens.every(daoToken => {
          const tokenClaims = claims.filter(x => x.token.address === daoToken.address); //filter claims by token
          if (!tokenClaims) return false; //no claimed tokens exist for the given DAO and token
          const totalClaimed : BigNumber = tokenClaims.reduce((a, b) => a.add(b.claimedAmount), BigNumber.from(0));
          return totalClaimed.add(BigNumber.from(daoToken.instantTransferAmount)).gte(daoToken.amount);
        });
      });
      returnVal = isClaimed;
    }
    return returnVal;
  }

  /**
   * returns milliseconds in the amount of fundingPeriod not yet used up between
   * fundingStartedAt and now, bottoming out at 0.
   * Returns -1 if funding has not been initiated.
   */
  @computedFrom("fundingWasInitiated", "fundingStartedAt", "fundingPeriod", "now")
  get timeLeftToExecute(): number | undefined {
    let returnVal = -1;
    if (this.fundingWasInitiated && this.fundingStartedAt && this.now){//need to check for fundingStartedAt and now because they are undefined on first load sometimes
      const timeLeft = (this.fundingStartedAt.getTime() + this.fundingPeriod * 1000) - this.now.getTime();
      returnVal = timeLeft > 0 ? timeLeft : 0;
    }
    return returnVal;
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

  /**
   * returns true if funding was started, execution never happened and
   * the funding period has passed.
   *
   * Can't be expired if funding was not initiated, which means it
   * can't be expired if cancelled or withdrawn.
   *
   * Can't be expired is executed.
   */
  @computedFrom("fundingWasInitiated", "isExecuted", "timeLeftToExecute")
  public get fundingPeriodHasExpired(): boolean {
    return this.fundingWasInitiated && !this.isExecuted && (this.timeLeftToExecute === 0);
  }

  @computedFrom("fundingPeriodHasExpired")
  public get isFailed() {
    return this.fundingPeriodHasExpired;
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
      return relatedToAccount ? this.partnerDao : this.primaryDao;
    }
    if (this.primaryDaoRepresentatives.has(this.ethereumService.defaultAccountAddress)){
      //the connceted account is either a representative of the primary DAO or the proposal lead
      return relatedToAccount ? this.primaryDao : this.partnerDao;
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

  @computedFrom("allVotes", "ethereumService.defaultAccountAddress")
  public get userVote(): boolean | null {
    return this.allVotes[this.ethereumService.defaultAccountAddress];
  }

  @computedFrom("allVotes")
  public get hasRepresentativeVoted(): boolean {
    return this.representativeVote() !== null;
  }

  @computedFrom("isActive", "isCompleted", "fundingPeriodHasExpired", "isCancelled", "isNegotiating", "isFunding", "isClaiming")
  public get status(): DealStatus {
    if (this.isActive) {
      return DealStatus.active;
    } else if (this.fundingPeriodHasExpired) {
      return DealStatus.failed;
    } else if (this.isCancelled) {
      return DealStatus.cancelled;
    } else if (this.isNegotiating) {
      return DealStatus.negotiating;
    }
    else if (this.isFunding) { return DealStatus.funding; }
    else if (this.isCompleted) { return DealStatus.completed; }
    // else if (this.isClaiming) { return DealStatus.claiming; }
    // else if (this.isTargetReached) { return DealStatus.targetReached; }
    // else if (!this.isTargetReached) { return DealStatus.targetNotReached; }
  }

  /**
   * key is the clauseId, value is the discussion key
   */
  @computedFrom("dealDocument.clauseDiscussions")
  public get clauseDiscussions(): Record<string, IDealDiscussion> {
    return this.dealDocument.clauseDiscussions ?? {};
  }

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

  @computedFrom("registrationData.proposalLead")
  public get proposalLead(): IProposalLead {
    return this.registrationData.proposalLead;
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
    this.hydrate().then(() => {

      this.aureliaHelperService.createCollectionWatch(this.primaryDao.tokens, () => {
        this.processTotalPrice();
      });

      this.primaryDao.tokens.forEach(token => {
        this.aureliaHelperService.createPropertyWatch(token, "amount", () => {
          this.processTotalPrice();
        });
        this.aureliaHelperService.createPropertyWatch(token, "decimals", () => {
          this.processTotalPrice();
        });
      });

      if (this.partnerDao?.tokens) {
        this.aureliaHelperService.createCollectionWatch(this.partnerDao.tokens, () => {
          this.processTotalPrice();
        });

        this.partnerDao.tokens.forEach(token => {
          this.aureliaHelperService.createPropertyWatch(token, "amount", () => {
            this.processTotalPrice();
          });
          this.aureliaHelperService.createPropertyWatch(token, "decimals", () => {
            this.processTotalPrice();
          });
        });
      }
    });
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

      if (this.partnerDao) {
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

      this.contractDealId = await this.moduleContract.metadataToDealId(formatBytes32String(this.id));

      // no need to await
      this.hydrateDaoTransactions();
      this.hydrateDaoClaims();
      this.processTotalPrice();
    }
    catch (error) {
      this.corrupt = true;
      this.consoleLogService.logMessage(`Deal: Error initializing deal ${error?.message}`, "error");
    } finally {
      this.initializing = false;
    }
  }

  public async hydrateDaoTransactions(): Promise<void> {
    const daoTokenTransactions = new Map<IDAO, Array<IDaoTransaction>>();

    daoTokenTransactions.set(this.primaryDao, await this.getDaoTransactions(this.primaryDao));
    if (this.partnerDao) {
      daoTokenTransactions.set(this.partnerDao, await this.getDaoTransactions(this.partnerDao));
    }

    this.daoTokenTransactions = daoTokenTransactions;
  }

  private async hydrateDaoClaims(): Promise<void> {
    const daoTokenClaims = new Map<IDAO, Array<IDaoClaim>>();
    //need to pass the other DAO into getDaoClaims because the contract swapped the tokens and the primary dao needs access to the partnerDao's tokens
    daoTokenClaims.set(this.primaryDao, await this.getDaoClaims(this.primaryDao, this.partnerDao));
    if (this.partnerDao) {
      //need to pass the other DAO into getDaoClaims because the contract swapped the tokens and the partner dao needs access to the primaryDao's tokens
      daoTokenClaims.set(this.partnerDao, await this.getDaoClaims(this.partnerDao, this.primaryDao));
    }

    this.daoTokenClaims = daoTokenClaims;
  }

  private async processTotalPrice(): Promise<void> {
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
      this.clauseDiscussions[discussionId] = discussion;
    });
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
    const deadline = 1712882813; // TODO: remove HACK this.fundingPeriod;

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
          //need to set the fundingStartedAt here because it will be undefined until the page refreshes and will cause an infinite loop of errors on the UI
          this.fundingStartedAt = new Date();
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

  public unlockTokens(dao: IDAO, token: Address, amount: BigNumber): Promise<TransactionReceipt> {
    const tokenContract = this.tokenService.getTokenContract(token);
    return this.transactionsService.send(() => tokenContract.approve(this.daoDepositContracts.get(dao).address, amount));
  }

  public depositTokens(dao: IDAO, tokenAddress: Address, amount: BigNumber): Promise<TransactionReceipt> {
    return this.transactionsService.send(
      () => this.daoDepositContracts.get(dao).deposit(
        this.moduleContract.address,
        this.contractDealId,
        tokenAddress,
        amount)
        .then(receipt => {
          if (receipt) {
            this.hydrateDaoTransactions();
            return receipt;
          }
        }));
  }

  public withdrawTokens(dao: IDAO, depositId: number): Promise<TransactionReceipt> {
    return this.transactionsService.send(
      () => this.daoDepositContracts.get(dao).withdraw(
        this.moduleContract.address,
        this.contractDealId,
        depositId)
        .then(receipt => {
          if (receipt) {
            this.hydrateDaoTransactions();
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
    const userAddress = this.ethereumService.defaultAccountAddress;

    if (upDown !== daoVotingSummary.votes[userAddress]) {
      const daoKey = whichDao.name === this.primaryDao.name ? "PRIMARY_DAO" : "PARTNER_DAO";
      return this.dataSourceDeals.updateVote(this.id, userAddress, daoKey, upDown)
        .then(() => {
          if (daoVotingSummary.votes[userAddress] === null) {
            this.dealDocument.votingSummary.totalSubmitted++;
          }
          daoVotingSummary.votes = {
            ...daoVotingSummary.votes,
            [userAddress]: upDown,
          };
        });
    }
  }

  public execute(): Promise<TransactionReceipt> {
    if (!this.isFailed) {
      return this.transactionsService.send(
        () => this.moduleContract.executeSwap(this.contractDealId))
        .then(async (receipt) => {
          if (receipt) {
            this.isExecuted = true;
            this.executedAt = new Date((await this.ethereumService.getBlock(receipt.blockNumber)).timestamp * 1000);
            return receipt;
          }
        });
    }
  }

  /**
   * Returns Map of token address to amount claimable.  Every token in the dao should be represented.
   * @param dao
   * @returns
   */
  public async getTokenClaimableAmounts(dao: IDAO): Promise<Map<Address, BigNumber>> {
    const results = new Map<Address, BigNumber>();

    const vestingInfo: { tokens: Array<Address>; amounts: Array<BigNumber> }
     = await this.daoDepositContracts.get(dao).callStatic.claimDealVestings(this.moduleContract.address, this.contractDealId);

    vestingInfo.tokens.forEach(( tokenAddress: Address, index: number ) => {
      results.set(tokenAddress, vestingInfo.amounts[index]);
    });

    return results;
  }

  private getTokenInfoFromDao(tokenAddress: Address, dao: IDAO): IToken {
    tokenAddress = tokenAddress.toLowerCase();
    return dao.tokens.find((token: IToken) => token.address.toLowerCase() === tokenAddress );
  }

  private daoVotingSummary(whichDao: IDAO): IDealDAOVotingSummary {
    return whichDao.name === this.primaryDao.name ?
      this.dealDocument.votingSummary.primaryDAO :
      this.dealDocument.votingSummary.partnerDAO;
  }

  private async getDaoClaims(dao: IDAO, otherDao: IDAO): Promise<Array<IDaoClaim>> {
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
            token: this.getTokenInfoFromDao(params.token, otherDao), // assign the other dao's tokens to the initial dao
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

    const depositFilter = depositContract.filters.Deposited(this.moduleContract.address, this.contractDealId);
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

    const withdrawFilter = depositContract.filters.Withdrawn(this.moduleContract.address, this.contractDealId);
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

  public setPrivacy(value: boolean): Promise<void> {
    return this.dataSourceDeals.updateDealIsPrivate(this.id, value)
      .then(() => {
        this.isPrivate = value;
      });
  }

  /**
   * Sets the additional token info from the contract
   */
  public setFundingContractInfo(token: ITokenCalculated, dao: IDAO): void {
    if (!this.isExecuted && this.daoTokenTransactions){
      //calculate only funding properties
      token.fundingDeposited = this.daoTokenTransactions.get(dao).reduce((a, b) => b.type === "deposit" ? a.add(b.amount) : a.sub(b.amount), BigNumber.from(0));
      // calculate the required amount of tokens needed to complete the swap by subtracting target from deposited
      token.fundingRequired = BigNumber.from(token.amount).sub(token.fundingDeposited);
      // calculate the percent completed based on deposited divided by target
      // We're using bignumberjs because BigNumber can't handle division
      token.fundingPercentCompleted = toBigNumberJs(token.fundingDeposited).dividedBy(token.amount).toNumber() * 100;
    }
  }

  public async setClaimingContractInfo(token: ITokenCalculated, dao: IDAO): Promise<void> {
    //calculate claiming properties
    if (this.isExecuted){
      await this.hydrateDaoClaims();
      const tokenClaimableAmounts = await this.getTokenClaimableAmounts(dao);
      if (tokenClaimableAmounts.size > 0){
        token.claimingClaimable = tokenClaimableAmounts.get(token.address);
        token.claimingClaimed = this.getClaimedAmount(dao, token.address);
        token.claimingLocked = BigNumber.from(token.amount).sub(BigNumber.from(token.instantTransferAmount).add(token.claimingClaimable).add(token.claimingClaimed));
      } else {
        token.claimingClaimable = BigNumber.from(0);
        token.claimingClaimed = BigNumber.from(0);
        token.claimingLocked = BigNumber.from(0);
      }
      token.claimingPercentCompleted = toBigNumberJs(token.claimingClaimed.add(BigNumber.from(token.instantTransferAmount))).dividedBy(token.amount).toNumber() * 100;
    }
  }

  /**
   * Gets the amount of tokens claimed by token
   */
  private getClaimedAmount(dao: IDAO, tokenAddress: string) : BigNumber{
    if (!this.daoTokenClaims) return BigNumber.from(0);
    const tokenClaims = this.daoTokenClaims.get(dao).filter(x => x.token.address === tokenAddress);
    if (!tokenClaims || !tokenClaims.length) return BigNumber.from(0);
    return tokenClaims.reduce((a, b) => a.add(b.claimedAmount), BigNumber.from(0));
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
        pathFrom.push([BigNumber.from(this.primaryDao.tokens[i].amount), zero]);
        pathTo.push([
          ...fourZeros,
          BigNumber.from(this.primaryDao.tokens[i].instantTransferAmount),
          BigNumber.from(this.primaryDao.tokens[i].vestedTransferAmount),
          this.primaryDao.tokens[i].cliffOf ?? 0,
          this.primaryDao.tokens[i].vestedFor ?? 0,
        ]);
      }
    }
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.partnerDao.tokens.length; i++) {
      if (!tokens.includes(this.partnerDao.tokens[i].address)) {
        tokens.push(this.partnerDao.tokens[i].address);
        pathFrom.push([zero, BigNumber.from(this.partnerDao.tokens[i].amount)]);
        pathTo.push([
          BigNumber.from(this.partnerDao.tokens[i].instantTransferAmount),
          BigNumber.from(this.partnerDao.tokens[i].vestedTransferAmount),
          this.partnerDao.tokens[i].cliffOf ?? 0,
          this.partnerDao.tokens[i].vestedFor ?? 0,
          ...fourZeros,
        ]);
      }
    }
    return { tokens, pathTo, pathFrom };
  }
}
