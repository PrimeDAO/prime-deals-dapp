import { IWizard } from "services/WizardService";

/* eslint-disable @typescript-eslint/consistent-type-assertions */
export interface IProposal {
  name: string,
  overview: string,
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
  name: string,
  symbol: string,
  balance: string,
  address: string,
}

export interface ISocialMedia {
  name: string,
  url: string,
}
export interface IDAO {
  id: string,
  name: string,
  tokens: Array<IToken>
  social_medias: Array<ISocialMedia>
  members: Array<string>,
  logo_url: string,
  platform?: Platforms,
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

export interface IBaseWizardStage {
  wizardManager: any;
  wizard: IWizard;
  errors?: {[key: string]: string};

  activate;
  attached: () => void;
  proceed?: () => void;
}
