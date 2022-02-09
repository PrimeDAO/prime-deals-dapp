import { IKey } from "services/DataSourceDealsTypes";

export interface IDealsData {
  votes: IKey;
  /**
   * CID for json that looks like:
   *
   * {
   *   "clauseId1": "discussionsKey1",
   *   "clauseId2": "discussionsKey2",
   *   "clauseId3": "discussionsKey3",
   * }
   */
  discussions: IKey;
  /**
   * CID for json that confirms to IDealRegistrationTokenSwap
   */
  registration: IKey;
  status: DealStatus;
}

export enum DealStatus {
  completed = "Completed",
  swapping = "Swapping",
  negotiating = "Negotiating",
  failed = "Failed",
  open = "Open",
  live = "Live",
  targetReached = "Target reached",
  swapCompleted = "Swap completed",
  targetNotReached = "Target not reached",
  fundingInProgress = "Funding in progress",
  closed = "Closed",
}

export interface IDeal {
  id: IKey;
  corrupt: boolean;
  clauseDiscussions: Map<string, string>;
  registrationData: any;
  initialize(): Promise<void>;
  create(id: IKey): IDeal;
  ensureInitialized(): Promise<void>;
  updateRegistration(registration: Record<string, any>): Promise<void>;
  addClauseDiscussion(clauseId: string, discussionKey: string): Promise<void>;
}
