import axios from "axios";
import { IpfsService } from "services/IpfsService";
import { Address } from "services/EthereumService";
import { autoinject } from "aurelia-framework";
import { IToken, IDealConfig } from "registry-wizard/dealConfig";

export interface IDealCreatedEventArgs {
  newDeal: Address;
  beneficiary: Address;
}

const _DAY_IN_MS = 24 * 60 * 60 * 1000;
const _DEFAULT_DEAL_DURATION = 14;
export interface IDaoPartner {
  daoId: string,
  organizationId: string,
  title: string,
  logo: string,
  totalNumMembers: number
  totalNumProposals: number
  totalNumVoters: number
  totalValueUSD: number
  totalInUSD: number
  totalOutUSD: number
  votersParticipation: number
  daoName: string,
  platform: string,
  thumbName: string
}

export interface IDaoAPIObject {
  daoName: string,
  organizationId: string,
  daoId: string,
  logo: string,
  daosArr: Array<IDaoPartner>,
  totalNumMembers: number,
  totalNumProposals: number,
  totalNumVoters: number,
  totalValueUSD: number,
  totalInUSD: number,
  totalOutUSD: number,
  votersParticipation: number,
  thumbName: string,
  platform: number,
  tokens: Array<IToken>,
}

@autoinject
export class DealService {

  public deals: Map<Address, any>;

  public dealsObject: any = {};
  public DAOs: Array<IDaoAPIObject>;

  public initializing = true;

  constructor(
    private ipfsService: IpfsService,
  ) {
  }

  public async initialize(): Promise<void> {
    /**
     * deals will take care of themselves on account changes
     */
    return this.getDeals();
  }

  private async getDeals(): Promise<void> {
    const hashes = await this.ipfsService.getPinnedObjectsHashes();
    hashes.forEach( async (hash:string) => {
      this.dealsObject[hash] = await this.ipfsService.getDealProposal(hash)
        .then(async (deal: any) => {
          if (!deal) return {};
          const timeLeft: number = deal.createdAt? (new Date(deal.createdAt).getTime()) + (_DAY_IN_MS * parseInt(deal.terms.period || _DEFAULT_DEAL_DURATION)) - (new Date().getTime()): 0;
          if (timeLeft < 0) deal.incomplete = true;
          return {
            address: hash || "",
            daos: {
              creator: deal.daos[0].id ? (await this.getDAOByOrganisationID(deal.daos[0].id)).daoName : deal.daos[0].name || "",
              partner: deal.daos[1].id ? (await this.getDAOByOrganisationID(deal.daos[1].id)).daoName : deal.daos[1].name || "",
            },
            type: deal.type || "Token Swap",
            title: deal.proposal.name,
            description: deal.proposal.overview,
            logo: {
              creator: deal.daos[0].id ? (await this.getDAOByOrganisationID(deal.daos[0].id)).logo : "../../logos/ether.png",
              partner: deal.daos[1].id ? (await this.getDAOByOrganisationID(deal.daos[1].id)).logo : "",
            },
            startsInMilliseconds: timeLeft,
            uninitialized: deal.uninitialized || false,
            hasNotStarted: deal.hasNotStarted || deal.createdAt,
            contributingIsOpen: deal.contributingIsOpen || false,
            claimingIsOpen: deal.claimingIsOpen || false,
            incomplete: deal.incomplete || false,
            isClosed: deal.isClosed || !deal.createdAt,
            isPaused: deal.isPaused || false,
          };
        });
    });
  }

  private _featuredDeals: Array<IDealConfig>;

  public async getFeaturedDeals(): Promise<Array<IDealConfig>> {

    if (this._featuredDeals) {
      console.log("returning cached featured deals");

      return await this._featuredDeals;
    }
    else {
      await this.getDeals();
      /**
       * take the first three deals in order of when they start(ed), if they either haven't
       * started or are live.
        */
      if (this.dealsObject) {
        const temp:Array<IDealConfig> = Object.values(this.dealsObject);
        this._featuredDeals = temp.sort((a: any, b: any) => a.startsInMilliseconds - b.startsInMilliseconds).slice(0, 12);
        return this._featuredDeals;
      }
    }
  }

  // public async deployDeal(config: IDealConfig): Promise<Hash> {
  //   // TODO
  // }

  public async getDAOsInformation(): Promise<void> {
    // TODO
    this.DAOs = await(await axios.get("http://localhost:3000/api/organizations/all")).data;
  }


  public async getDAOsTokenList(id: string): Promise<Array<IToken>> {
    return await (await axios.get(`http://localhost:3000/api/daos/${id}/tokens`)).data;
  }

  public async getDAOByOrganisationID(id: string): Promise<IDaoAPIObject> {
    if (!this.DAOs) await this.getDAOsInformation;

    const dao: IDaoAPIObject = this.DAOs.filter(dao => dao.organizationId === id)[0];
    return dao;
  }

  private asciiToHex(str = ""): string {
    const res = [];
    const { length: len } = str;
    for (let n = 0, l = len; n < l; n++) {
      const hex = Number(str.charCodeAt(n)).toString(16);
      res.push(hex);
    }
    return `0x${res.join("")}`;
  }
}
