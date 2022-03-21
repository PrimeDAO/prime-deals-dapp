import { IDealRegistrationTokenSwap } from "../../src/entities/DealRegistrationTokenSwap";

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
