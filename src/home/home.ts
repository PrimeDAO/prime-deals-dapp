import {DealService} from "services/DealService";
import {autoinject, computedFrom, singleton} from "aurelia-framework";
import {Router} from "aurelia-router";
import "./home.scss";
import { DealTokenSwap } from "entities/DealTokenSwap";

type DealType = "open" | "partnered";
@singleton(false) // to maintain tab selection state
@autoinject
export class Home {
  cardIndex = 0;
  dealType:DealType = "open";
  static MAX_DEALS_COUNT=10;

  constructor(
    private router: Router,
    private dealService: DealService,
  ) {
  }

  @computedFrom("dealService.openProposals", "dealService.partneredDeals")
  private get allDeals(): Record<"open" | "partnered", Array<DealTokenSwap>> {
    return {
      open: this.dealService.openProposals.slice(0, Home.MAX_DEALS_COUNT),
      partnered: this.dealService.partneredDeals.slice(0, Home.MAX_DEALS_COUNT),
    };
  }

  @computedFrom("allDeals", "dealType")
  private get featuredDeals(): Array<DealTokenSwap> {
    return this.allDeals[this.dealType];
  }

  async attached(): Promise<void> {
    await this.dealService.ensureAllDealsInitialized();

    if (this.cardIndex === undefined) {
      this.cardIndex = this.allDeals.open.length ? 0 : 1;
    }
  }

  dealToggle(index: number, type: "open" | "partnered"): void {
    this.dealType = type;
    this.cardIndex = index;
  }

  navigate(href: string): void {
    this.router.navigate(href);
  }
}
