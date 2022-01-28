import { autoinject } from "aurelia-framework";
import { EthereumService, Hash } from "services/EthereumService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { DisposableCollection } from "services/DisposableCollection";
import { Utils } from "services/utils";
import { DataSourceDeals } from "services/DataSourceDeals";

export interface IDealsData {
  // votes: Hash; // Array<IVoteInfo>;
  // discussions: Hash; // Array<IClause, Hash>;
  registration: Hash; // RegistrationData;
}

export interface IProposal {
  title: string,
  summary: string,
  description: string;
}

export enum Platforms {
  "Independent",
  "DAOstack",
  "Moloch",
  "OpenLaw",
  "Aragon",
  "Colony",
  "Compound Governance",
  "Snapshot",
  "Gnosis Safe / Snapshot",
  "Substrate",
}

export interface IToken {
  name: string,
  symbol: string,
  balance: string,
  address: string,
}

export interface ISocialMedia {
  name: string,
  url: string,
}
export interface IDAO {
  id: string,
  name: string,
  tokens: Array<IToken>
  social_medias: Array<ISocialMedia>
  members: Array<string>,
  logo_url: string,
  platform?: Platforms,
}

export interface IProposalLead {
  address: string,
  email?: string;
  dao?: IDAO
}

export interface IClause {
  text: string,
  tag: string,
}

export interface ITerms {
  clauses: Array<IClause>,
  period: number,
  representatives: string,
  coreTeamChatURL: string,
  previousDiscussionURL: string,
}

export interface IDealRegistrationData {
  version: string;
  proposal: IProposal;
  primaryDAO: IDAO;
  partnerDAO: IDAO;
  proposalLead: IProposalLead; // this contains to address
  terms: ITerms;
  keepAdminRights: boolean;
  offersPrivate: boolean;
  isPrivate: boolean;
  createdAt: Date | null;
  modifiedAt: Date | null;
  createdByAddress: string | null;
  executionPeriodInDays: number;
  dealType: "token-swap" | "joint-venture"; // @TODO do we need dealType?
}

@autoinject
export class Deal {
  public contract: any;
  public id: Hash;
  public rootData: IDealsData;
  public dealInitialized: boolean;

  public initializing = true;
  public corrupt = false;

  private initializedPromise: Promise<void>;
  private subscriptions = new DisposableCollection();

  public registrationData: IDealRegistrationData;
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
    private dataSourceDeals: DataSourceDeals,
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

      this.rootData = await this.dataSourceDeals.get<IDealsData>(this.id);
      this.registrationData = await this.dataSourceDeals.get<IDealRegistrationData>(this.rootData.registration);
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
    }
  }
}
