import { autoinject } from "aurelia-framework";
import { EthereumService, Hash } from "services/EthereumService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { DisposableCollection } from "services/DisposableCollection";
import { Utils } from "services/utils";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { IDealRegistrationData } from "entities/DealRegistrationData";

export interface IDealsData {
  // votes: Hash; // Array<IVoteInfo>;
  registrationData: IDealRegistrationData; // RegistrationData;
  discussions: Hash[];
}

@autoinject
export class Deal implements IDealsData {
  public contract: any;
  public id: Hash;
  public rootData: IDealsData;
  public dealInitialized: boolean;

  public initializing = true;
  public corrupt = false;

  private initializedPromise: Promise<void>;
  private subscriptions = new DisposableCollection();

  public registrationData: IDealRegistrationData;
  public discussions: Hash[];
  public status: "Completed" | "Swapping" | "Negotiating" | "Failed" | "Open" | "Live" | "Target reached" | "Swap completed" | "Target not reached" | "Funding in progress" | "Closed";
  // public get votes(): Array<IVoteInfo> {
  //   return this.rootData.votes;
  // }

  // public get discussions(): Array<Array<IClause, Hash>> {
  //   return this.rootData.discussions;
  // }

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

  public create(id: Hash): Deal {
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
      this.consoleLogService.logMessage(`Deal: Error initializing deal ${error?.message}`, "error");
    }
  }

  private async hydrate(): Promise<void> {
    // eslint-disable-next-line no-empty
    try {
      // RootOfRoot is stream of Deal cids (which will become Deal.id)

      // rootOfRoot - immutable cid
      /**
       * Collection of                  DealCids
       *    ^                ^              ^           ^
       *    |                |              |           |
       *   appending      registration    votes    discussion
       *                        ^
       *                        |
       *
       * Find appending --> bottleneck
       */

      const dealsData = await this.dataSourceDeals.get<IDealsData>(this.id);
      // dealsData.terms.clauses.map(async (clause) => {
      //   clause.text
      // })
      // this.discussions = await this.dataSourceDeals.get<IDealDiscussions>(this.rootData.registrationData.id);

      // this.registrationData = await this.dataSourceDeals.get<IDealRegistrationData>(this.rootData.registration);
      // this.discussions = await this.rootData.discussions.map(discussion => this.dataSourceDeals.get<IDealDiscussion>(discussion).discussionId);
      // this.discussions = await this.dataSourceDeals.get<IDealDiscussions>(this.id);
      // console.log("discussion items", this.discussions.items);

      this.rootData = {
        registrationData: dealsData.registrationData,
        discussions: dealsData.discussions,
      };

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

    // eslint-disable-next-line no-empty
    if (account) {
      //
    }
  }

  public async createRegistration(registration: IDealRegistrationData): Promise<void> {
    this.dataSourceDeals.create("key", JSON.stringify(registration));
  }

  /**
   * has to be able to update individual parts of the registration or any other data (votes, discussions)
   */
  public async updateDealRegistration(registration: IDealRegistrationData): Promise<void> {
    this.dataSourceDeals.update("key", JSON.stringify(registration));
  }
}
