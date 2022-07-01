import { IDealDiscussion } from "./DealDiscussions";
import { IDealRegistrationTokenSwap } from "./DealRegistrationTokenSwap";

export type IVotesInfo = Record<string, boolean | null>;

export interface IDealDAOVotingSummary {
  totalSubmittable: number;
  acceptedVotesCount: number;
  rejectedVotesCount: number;
  votes: IVotesInfo;
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
  swapTxHash?: string,
}

export enum DealStatus {
  active = "Active",
  failed = "Failed",
  cancelled = "Cancelled",
  negotiating = "Negotiating",
  funding = "Funding",
  completed = "Completed",
}

export interface IDeal {
  id: string;
  corrupt: boolean;
  clauseDiscussions: Record<string, IDealDiscussion>;
  registrationData: any;
  initialize(): Promise<void>;
  create<TDealDocumentType extends IDealTokenSwapDocument>(doc: TDealDocumentType): IDeal;
  ensureInitialized(): Promise<void>;
  addClauseDiscussion(clauseId: string, discussion: IDealDiscussion): Promise<void>;
  status: DealStatus;
}
