import {DealService} from "services/DealService";
import {autoinject, computedFrom, singleton} from "aurelia-framework";
import {Router} from "aurelia-router";
import "./home.scss";
import { DealTokenSwap } from "entities/DealTokenSwap";

type DealType = "open" | "partnered";
@singleton(false) // to maintain tab selection state
@autoinject
export class Home {
  private cardIndex = 1;
  private dealType:DealType = "partnered";
  private dealsLoading = false;
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
    return this.allDeals[this.dealType].slice(0, 10).filter((deal: DealTokenSwap) => !deal.isCancelled && !deal.isFailed);
  }

  async attached(): Promise<void> {
    this.dealsLoading = true;
    await this.dealService.ensureAllDealsInitialized();
    this.dealsLoading = false;

    if (this.cardIndex === undefined) {
      this.cardIndex = this.allDeals.partnered.length ? 1 : 0;
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
