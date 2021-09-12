import axios from "axios";
// import { threadId } from "worker_threads";

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

export interface IDealConfig {
  /**
   * semantic version of this interface. This value must be updated upon any released changes.
   */
  version: string;
  proposal: IProposal,
  daos: Array<IDAO>,
  admins: Array<IAdmin>,
  terms: ITerms,
  createdAt: Date | null,
  modifiedAt: Date | null,
  createdByAddress: string | null,
  clearState: () => void,
}

export interface IDeepDaoInfo {
  id: string,
  title: string,
  isActive: boolean,
  mainSiteLink: string,
  logo: string,
  twitter: string,
  telegram: string,
  discord: string,
  github: string,
  createdAt: string,
  organizationId: string,
  daoId: string,
  rankings: string,
  indices: string,
  proposals: string,
  members: string,
  votersCoalition: string,
  financial: string,
  platform: Platforms
}

export class DealConfig implements IDealConfig {
  public version: string;
  public proposal: IProposal;
  public daos: Array<IDAO>;
  public terms: ITerms;
  public admins: Array<IAdmin>;
  public createdAt: Date | null;
  public modifiedAt: Date | null;
  public createdByAddress: string | null;

  constructor() {
    this.clearState();
  }

  clearState(): void {
    this.version = "0.0.1";
    this.proposal = {
      name: "",
      overview: "",
    } as IProposal;
    this.daos = [
      {
        name: "",
        tokens: [{
          name: "",
          symbol: "",
          balance: "",
          address: "",
        }],
        social_medias: [{name: undefined, url: undefined}],
        logo_url: null,
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
    this.createdAt = null;
    this.modifiedAt = null;
    this.createdByAddress = null;
  }

  public async getDaoInfoFromDeepDAO(daoId: string): Promise<IDeepDaoInfo> {
    const daoInfo = await (await axios.get(`https://backend.deepdao.io/dao/ksdf3ksa-937slj3/${daoId}`)).data;
    return daoInfo;
  }

  public async populateTokensFromDeepDAO(daoId: string): Promise<Array<IToken>> {
    const daoTokens = JSON.parse((await this.getDaoInfoFromDeepDAO(daoId)).financial).tokens;
    console.log(daoTokens);

    return daoTokens.map(token => {
      return {
        name: token.tokenName,
        symbol: token.tokenSymbol,
        balance: token.tokenBalance,
        address: token.tokenAddress,
      };
    });
  }

  // populateMembersFromDeepDAO(): void {
  // }
  // populateSocialMediaFromDeepDAO(): void {
  // }
}
