import { DealStatus, IDeal, IDealsData } from "entities/IDealTypes";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";
import { ITokenInfo, TokenService } from "./../services/TokenService";

import { ConsoleLogService } from "services/ConsoleLogService";
import { DisposableCollection } from "services/DisposableCollection";
import { EthereumService } from "services/EthereumService";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { Utils } from "services/utils";
import { autoinject } from "aurelia-framework";

@autoinject
export class DealTokenSwap implements IDeal {
  private initializedPromise: Promise<void>;
  private subscriptions = new DisposableCollection();
  private rootData: IDealsData;

  public id: IKey;
  public dealInitialized: boolean;
  public isLoadingPrice: boolean;
  public totalPrice: number;
  public initializing = true;
  public corrupt = false;

  public registrationData: IDealRegistrationTokenSwap;

  public status: DealStatus;
  // public get votes(): Array<IVoteInfo> {
  //   return this.rootData.votes;
  // }

  /**
   * key is the clauseId, value is the discussion key
   */
  public clauseDiscussions: Map<string, string>;

  public get isOpen(): boolean {
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
    this.isLoadingPrice = false;
    this.id = id;
    return this;
  }
  async loadDealSize(){
    if (!this.isLoadingPrice){
      this.isLoadingPrice = true;
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
        total += currentToken.price * Number(x.amount);
      });
      this.totalPrice = total;
      this.isLoadingPrice = false;
    }
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
      if (this.statuses.length === Object.keys(DealStatus).length) { this.shuffleArray(this.statuses);}
      this.status = this.statuses.shift();
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
