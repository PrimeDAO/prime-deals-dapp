import { autoinject } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { DisposableCollection } from "services/DisposableCollection";
import { Utils } from "services/utils";
import { IDataSourceDeals, IKey } from "services/DataSourceDealsTypes";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IDeal, IDealsData } from "entities/IDealTypes";

@autoinject
export class DealTokenSwap implements IDeal {
  private initializedPromise: Promise<void>;
  private subscriptions = new DisposableCollection();
  private rootData: IDealsData;

  public id: IKey;
  public dealInitialized: boolean;

  public initializing = true;
  public corrupt = false;

  public registrationData: IDealRegistrationTokenSwap;

  public status: "Completed" | "Swapping" | "Negotiating" | "Failed" | "Open" | "Live" | "Target reached" | "Swap completed" | "Target not reached" | "Funding in progress" | "Closed";
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

  private async hydrate(): Promise<void> {
    // eslint-disable-next-line no-empty
    try {
      this.rootData = await this.dataSourceDeals.get<IDealsData>(this.id);
      this.registrationData = await this.dataSourceDeals.get<IDealRegistrationTokenSwap>(this.rootData.registration);
      const discussionsMap = await this.dataSourceDeals.get<Record<string, string> | undefined>(this.rootData.discussions);
      this.clauseDiscussions = new Map(Object.entries(discussionsMap ?? {}));
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
