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
  address: string,

  name: string,
  symbol: string,
  decimals: number,
  logoURI: string,

  amount: string
  instantTransferAmount: string
  vestedTransferAmount: string
  vestedFor: number
  cliffOf: number
}

export interface ISocialMedia {
  name: string,
  url: string,
}

export interface IDAO {
  name: string;
  treasury_address: string;
  logoURI: string;
  social_medias: Array<ISocialMedia>;
  representatives: Array<{address: string}>;
  id?: string;
  tokens?: Array<IToken>;
  platform?: Platforms;
}

export interface IProposalLead {
  address: string,
  email?: string;
  // dao?: IDAO /* Deprecated: Proposal lead does not need to be part of the a DAO */
}

export interface IClause {
  id: string,
  text: string,
}

export interface ITerms {
  clauses: Array<IClause>,
  // period: number, /* Deprecated: Is provided as executionPeriodInDays */
  // representatives: string, /* Deprecated: Is provided in IDAO information as members */
  coreTeamChatURL: string,
  previousDiscussionURL: string,
}

export interface IDealRegistrationTokenSwap {
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
  dealType: "token-swap"/* | "co-liquidity-provision"*/;
}

export class DealRegistrationTokenSwap implements IDealRegistrationTokenSwap {
  public version: string;
  public proposal: IProposal;
  public primaryDAO: IDAO;
  public partnerDAO: IDAO;
  public proposalLead: IProposalLead; // this maps to address
  public terms: ITerms;
  public keepAdminRights: boolean;
  public offersPrivate: boolean;
  public isPrivate: boolean;
  public createdAt: Date | null;
  public modifiedAt: Date | null;
  public createdByAddress: string | null;
  public executionPeriodInDays: number;
  public dealType: "token-swap"/* | "co-liquidity-provision" */;

  constructor() {
    this.clearState();
  }

  clearState(): void {
    this.version = "0.0.1";
    this.proposal = {
      title: "",
      summary: "",
      description: "",
    };
    this.primaryDAO = {
      name: "",
      tokens: [{
        address: "",
        name: undefined,
        symbol: undefined,
        decimals: undefined,
        logoURI: undefined,
        amount: undefined,
        instantTransferAmount: undefined,
        vestedTransferAmount: undefined,
        vestedFor: undefined,
        cliffOf: undefined,
      }],
      treasury_address: "",
      representatives: [{address: ""}],
      social_medias: [{name: "", url: ""}],
      logoURI: null,
    };
    this.partnerDAO = {
      name: "",
      tokens: [{
        address: "",
        name: undefined,
        symbol: undefined,
        decimals: undefined,
        logoURI: undefined,
        amount: undefined,
        instantTransferAmount: undefined,
        vestedTransferAmount: undefined,
        vestedFor: undefined,
        cliffOf: undefined,
      }],
      treasury_address: "",
      representatives: [{address: ""}],
      social_medias: [{name: "", url: ""}],
      logoURI: null,
    };
    this.proposalLead = {
      address: "",
      email: "",
    };
    this.keepAdminRights = true;
    this.offersPrivate = false;
    this.isPrivate = false;
    this.createdAt = null;
    this.modifiedAt = null;
    this.createdByAddress = null;
  }
}
