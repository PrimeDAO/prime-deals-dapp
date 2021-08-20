// import { threadId } from "worker_threads";

/* eslint-disable @typescript-eslint/consistent-type-assertions */
export interface IProposal {
  name: string,
  overview: string,
}

export interface IDAO {
  name: string,
  tokens: Array<{name: string, amount: number }>
  social_medias: Array<{name: string, url: string }>
}

export interface IAdmin {
  address: string,
  represent: IDAO
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

export interface ISeedConfig {
  /**
   * semantic version of this interface. This value must be updated upon any released changes.
   */
  version: string;
  proposal: IProposal,
  daos: Array<IDAO>,
  admins: Array<IAdmin>,
  terms: ITerms,
  clearState: () => void,
}

export class SeedConfig implements ISeedConfig {
  public version: string;
  public proposal: IProposal;
  public daos: Array<IDAO>;
  public admins: Array<IAdmin>;
  public terms: ITerms;

  constructor() {
    this.clearState();
  }

  clearState(): void {
    this.version = "1.0.0";
    this.proposal = {
      name: "",
      overview: "",
    } as IProposal;
    this.daos = [
      {
        name: "",
        tokens: [{name: undefined, amount: undefined}],
        social_medias: [{name: undefined, url: undefined}],
      },
      {
        name: "",
        tokens: [{name: undefined, amount: undefined}],
        social_medias: [{name: undefined, url: undefined}],
      },
    ] as IDAO[];
    this.terms = {
      clauses: [{text: "", tag: ""}] as IClause[],
      period: 14,
      representatives: "",
      previousDiscussionURL: "",
    } as ITerms;
    this.admins = [{address: undefined, represent: undefined}] as IAdmin[];
  }
}
