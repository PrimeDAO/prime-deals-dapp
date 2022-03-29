import { IDealDiscussion } from "./DealDiscussions";
import { IDealRegistrationTokenSwap } from "./DealRegistrationTokenSwap";

export interface IVoteInfo {
  address: string;
  vote: boolean;
}

export interface IDealDAOVotingSummary {
  totalSubmittable: number;
  acceptedVotesCount: number;
  rejectedVotesCount: number;
  votes: IVoteInfo[];
}

export interface IDealVotingSummary {
  primaryDAO: IDealDAOVotingSummary,
  partnerDAO: IDealDAOVotingSummary,
  totalSubmittable: number;
  totalSubmitted: number;
}

export interface IDealTokenSwapDocument {
  id: string;
  registrationData: IDealRegistrationTokenSwap;
  clauseDiscussions: Record<string, IDealDiscussion>;
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
  clauseDiscussions: Map<string, IDealDiscussion>;
  registrationData: any;
  initialize(): Promise<void>;
  create<TDealDocumentType extends IDealTokenSwapDocument>(doc: TDealDocumentType): IDeal;
  ensureInitialized(): Promise<void>;
  addClauseDiscussion(clauseId: string, discussion: any): Promise<void>;
  status: DealStatus;
}
