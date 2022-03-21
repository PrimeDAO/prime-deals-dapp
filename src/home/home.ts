import {DealService} from "services/DealService";
import {autoinject, singleton} from "aurelia-framework";
import {Router} from "aurelia-router";
import "./home.scss";
import { DealTokenSwap } from "entities/DealTokenSwap";

@singleton(false)
@autoinject
export class Home {
  cardIndex = 0;
  static MAX_DEALS_COUNT=10;

  featuredDeals: Array<DealTokenSwap> = [];
  allDeals: Record<"open" | "partnered", Array<DealTokenSwap>> = {
    open: [],
    partnered: [],
  };

  constructor(
    private router: Router,
    private dealService: DealService,
  ) {
  }

  async attached(): Promise<void> {
    // console.clear();
    /* prettier-ignore */ console.log("TCL ~ file: home.ts ~ line 25 ~ Home ~ attached ~ attached");
    // debugger;
    await this.dealService.ensureAllDealsInitialized();
    this.allDeals.open = this.dealService.openProposals.slice(0, Home.MAX_DEALS_COUNT);
    this.allDeals.partnered = this.dealService.partneredDeals.slice(0, Home.MAX_DEALS_COUNT);
    this.featuredDeals = this.allDeals.open.length ? this.allDeals.open : this.allDeals.partnered;

    this.cardIndex = this.allDeals.open.length ? 0 : 1;
  }

  dealToggle(index: number, type: "open" | "partnered"): void {
    this.featuredDeals = this.allDeals[type];
    this.cardIndex = index;
  }

  navigate(href: string): void {
    this.router.navigate(href);
  }
}
