import { IpfsService } from "./IpfsService";
import { Address } from "./EthereumService";
import { autoinject } from "aurelia-framework";
import { IDealConfig } from "../registry-wizard/dealConfig";

export interface IDealCreatedEventArgs {
  newDeal: Address;
  beneficiary: Address;
}

@autoinject
export class DealService {

  public deals: Map<Address, any>;

  public dealsObject: any = {};

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
          return {
            address: hash || "",
            dao: deal.daos[0].name || "",
            type: deal.type || "Token Swap",
            title: deal.proposal.name,
            description: deal.proposal.overview,
            logo: {
              creator: deal.daos[0].logo || "../../logos/ether.png",
              partner: deal.daos[1].logo || "",
            },
            startsInMilliseconds: deal.createdAt? (new Date(deal.createdAt).getUTCMilliseconds()) + 1000 * 60 * 60 * 24 * parseInt(deal.terms.period || 14): 0,
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

      return this._featuredDeals;
    }
    else {
      await this.getDeals();

      /**
       * take the first three deals in order of when they start(ed), if they either haven't
       * started or are live.
       */
      this._featuredDeals = Object.values(await this.dealsObject);
      // .filter((deal: Deal) => { return !deal.uninitialized && !deal.corrupt && (deal.hasNotStarted || deal.contributingIsOpen); })
      // .sort((a: Deal, b: Deal) => SortService.evaluateDateTimeAsDate(a.startTime, b.startTime))
      // .slice(0, 12);

      return this._featuredDeals.slice(0, 12);
    }
  }

  // public async deployDeal(config: IDealConfig): Promise<Hash> {
  //   // TODO
  // }

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
