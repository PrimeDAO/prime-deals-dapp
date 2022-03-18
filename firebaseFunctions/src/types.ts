interface IProposal {
  title: string,
  summary: string,
  description: string;
}

enum Platforms {
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

interface IToken {
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

interface ISocialMedia {
  name: string,
  url: string,
}

interface IDAO {
  name: string;
  treasury_address: string;
  logoURI: string;
  social_medias: Array<ISocialMedia>;
  representatives: Array<{address: string}>;
  id?: string;
  tokens?: Array<IToken>;
  platform?: Platforms;
}

interface IProposalLead {
  address: string,
  email?: string;
  // dao?: IDAO /* Deprecated: Proposal lead does not need to be part of the a DAO */
}

interface IClause {
  id: string,
  text: string,
}

interface ITerms {
  clauses: Array<IClause>,
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
  dealType: "token-swap"/* | "co-liquidity"*/;
}

export interface IDAOVotingSummary {
  total: number;
  accepted: number;
  rejected: number;
  votes: {
    address: string;
    vote: boolean;
  }[];
}

export interface IVotingSummary {
  primaryDAO: IDAOVotingSummary,
  partnerDAO: IDAOVotingSummary,
  total: number;
  votesGiven: number;
}

export interface IFirebaseDocument<T = any> {
  id: string;
  data: T;
}

export interface ITokenSwapDeal {
  registrationData: IDealRegistrationTokenSwap;
  meta: {
    isReady: boolean;
    representativesAddresses: Array<string>;
    votingSummary: IVotingSummary;
  }
}
