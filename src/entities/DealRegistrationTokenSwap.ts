// Importing external dependencies in this file breaks firebase function which import interfaces from here

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

export interface IRepresentative {
  address: string;
}
export interface IDAO {
  name: string;
  treasury_address: string;
  logoURI: string;
  social_medias: Array<ISocialMedia>;
  representatives: Array<IRepresentative>;
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
}

export interface IDealRegistrationTokenSwap {
  version: string;
  proposal: IProposal;
  primaryDAO: IDAO;
  partnerDAO?: IDAO; // This doesn't exist for an Open Proposal
  proposalLead: IProposalLead; // this contains to address
  terms: ITerms;
  keepAdminRights: boolean;
  offersPrivate: boolean;
  isPrivate: boolean;
  fundingPeriod: number;
  dealType: "token-swap" | "joint-venture"
  ;
}

export function emptyDaoDetails(): IDAO {
  return {
    name: "",
    tokens: [],
    treasury_address: "",
    representatives: [{address: ""}],
    social_medias: [],
    logoURI: null,
  };
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
  public fundingPeriod: number;
  public dealType: IDealRegistrationTokenSwap["dealType"];

  constructor(isPartneredDeal = false) {
    this.clearState(isPartneredDeal);
  }

  clearState(isPartneredDeal: boolean): void {
    this.version = "0.0.2";
    this.proposal = {
      title: "",
      summary: "",
      description: "",
    };
    this.primaryDAO = emptyDaoDetails();
    this.proposalLead = {
      address: "",
      email: "",
    };
    this.terms = {
      clauses: [{
        id: "",
        text: "",
      }],
    };
    this.keepAdminRights = true;
    this.offersPrivate = false;
    this.isPrivate = false;
    if (isPartneredDeal) {
      this.partnerDAO = emptyDaoDetails();
    }
    this.fundingPeriod = null;
    this.dealType = "token-swap";
  }
}
