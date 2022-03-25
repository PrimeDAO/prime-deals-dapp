import { IDealRegistrationTokenSwap } from "./DealRegistrationTokenSwap";
export interface IDealDAOVotingSummary {
  totalVotesCount: number;
  acceptedVotesCount: number;
  rejectedVotesCount: number;
  votes: {
    address: string;
    vote: boolean;
  }[];
}

export interface IDealVotingSummary {
  primaryDAO: IDealDAOVotingSummary,
  partnerDAO: IDealDAOVotingSummary,
  totalVotesCount: number;
  givenVotesCount: number;
}

export interface IDealTokenSwapDocument {
  id: string;
  registrationData: IDealRegistrationTokenSwap;
  discussions: any; // TODO
  representativesAddresses: Array<string>;
  votingSummary: IDealVotingSummary;
  createdAt: string,
  modifiedAt: string,
  createdByAddress: string;
  isWithdrawn: boolean,
  isRejected: boolean,
}

export enum DealStatus {
  active = "Active",
  completed = "Completed",
  failed = "Failed",
  closed = "Closed",
  negotiating = "Negotiating",
  funding = "Funding in progress",
  swapping = "Swapping",
}

export interface IDeal {
  id: string;
  corrupt: boolean;
  clauseDiscussions: Map<string, string>;
  registrationData: any;
  initialize(): Promise<void>;
  create<TDealDocumentType extends IDealTokenSwapDocument>(doc: TDealDocumentType): IDeal;
  ensureInitialized(): Promise<void>;
  addClauseDiscussion(clauseId: string, discussionKey: string): Promise<void>;
  status: DealStatus;
}
