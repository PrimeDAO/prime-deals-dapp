import { DealStatus, IDeal, IDealsData } from "entities/IDealTypes";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";
import { ITokenInfo, TokenService } from "services/TokenService";

import { ConsoleLogService } from "services/ConsoleLogService";
import { DisposableCollection } from "services/DisposableCollection";
import { EthereumService } from "services/EthereumService";
import { IDealRegistrationTokenSwap, IRepresentative } from "entities/DealRegistrationTokenSwap";
import { Utils } from "services/utils";
import { autoinject } from "aurelia-framework";

@autoinject
export class DealTokenSwap implements IDeal {
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
   * the id used by the TokenSwapModule contract to identify this deal.  Is
   * generated when funding is initiated by the Proposal Lead, and obtained
   * from the resulting TokenSwapModule.TokenSwapCreated event.
   */
  public contractDealId: number;
  /**
   * is detected by the presence of an TokenSwapModule.TokenSwapExecuted for this deal
   */
  public isExecuted: boolean;
  /**
   * computed at hydrate time
   */
  public isFailed: boolean;
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
   * Open Proposal, open for offers
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
   * Same as isVoting
   * @returns
   */
  public get isNegotiating(): boolean {
    return this.isVoting;
  }

  public get fundingWasInitiated(): boolean {
    return !!this.contractDealId;
  }

  public get isFunding(): boolean {
    // ????????? is supposed to be a timeout ?????????
    return this.fundingWasInitiated && !this.isExecuted;
  }

  /**
   * poor naming of this status by bizdev because it is being defined to
   * actually be the funding period when swapping (claiming) isn't actually occurring.
   */
  public get isSwapping(): boolean {
    return this.isFunding;
  }

  public get isClaiming(): boolean {
    return this.isExecuted && !this.isFailed;
  }

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
    else if (this.isFailed) { return DealStatus.failed; }
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

  constructor(
    private consoleLogService: ConsoleLogService,
    private ethereumService: EthereumService,
    private dataSourceDeals: IDataSourceDeals,
    private tokenService: TokenService,
  ) {
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
  async loadDealSize() {
    // if the total price is already figured out we don't need to try again
    if (this.totalPrice !== undefined) return;
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
  private async loadContracts(): Promise<void> {
    try {
      // this.contract = await this.contractsService.getContractAtAddress(ContractNames.DEAL, this.address);
    }
    catch (error) {
      this.corrupt = true;
      this.initializing = false;
      this.consoleLogService.logMessage(`DealTokenSwap: Error initializing deal ${error?.message}`, "error");
    }
  }

  /* ++++ TEMPORARY UNTIL STATUS LOGIC IS SORTED OUT ++++ */
  private statuses = Object.values(DealStatus);
  private shuffleArray(array): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  /* ++++ ------------------------------------------ ++++ */

  private async hydrate(): Promise<void> {
    // eslint-disable-next-line no-empty
    try {
      this.rootData = await this.dataSourceDeals.get<IDealsData>(this.id);
      this.registrationData = await this.dataSourceDeals.get<IDealRegistrationTokenSwap>(this.rootData.registration);
      const discussionsMap = await this.dataSourceDeals.get<Record<string, string> | undefined>(this.rootData.discussions);
      this.clauseDiscussions = new Map(Object.entries(discussionsMap ?? {}));

      /* ++++ TEMPORARY UNTIL STATUS LOGIC IS SORTED OUT ++++ */
      // if (this.statuses.length === Object.keys(DealStatus).length) { this.shuffleArray(this.statuses);}
      // this.status = this.statuses.shift();
      /* ++++ ------------------------------------------ ++++ */
    }
    catch (error) {
      this.corrupt = true;
      this.consoleLogService.logMessage(`Deal: Error initializing deal ${error?.message}`, "error");
    } finally {
      this.initializing = false;
    }
  }

  public ensureInitialized(): Promise<void> {
    return this.initializedPromise;
  }

  private async hydrateUser(): Promise<void> {
    const account = this.ethereumService.defaultAccountAddress;

    if (account) {
      // TODO- Is it necessary?
    }
  }

  public updateRegistration(registration: IDealRegistrationTokenSwap): Promise<void> {
    return this.dataSourceDeals.update(this.id, JSON.stringify(registration));
  }

  public addClauseDiscussion(clauseId: string, discussionKey: string): Promise<void> {
    this.clauseDiscussions.set(clauseId, discussionKey);
    const clauseDiscussionsObject = Object.fromEntries(this.clauseDiscussions);
    return this.dataSourceDeals.update(discussionKey, JSON.stringify(clauseDiscussionsObject)); // TODO check if this line works correctly
  }
}
