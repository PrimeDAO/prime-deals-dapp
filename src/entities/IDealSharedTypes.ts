import { IDealRegistrationTokenSwap } from "./DealRegistrationTokenSwap";

export interface IDealDAOVotingSummary {
  total: number;
  accepted: number;
  rejected: number;
  votes: {
    address: string;
    vote: boolean;
  }[];
}

export interface IDealVotingSummary {
  primaryDAO: IDealDAOVotingSummary,
  partnerDAO: IDealDAOVotingSummary,
  total: number;
  votesGiven: number;
}

export interface IDealTokenSwapDocument {
  registrationData: IDealRegistrationTokenSwap;
  discussions: any; // TODO
  isReady: boolean;
  representativesAddresses: Array<string>;
  votingSummary: IDealVotingSummary;
}
