import { singleton } from "aurelia";

// type DealType = "open" | "partnered";
@singleton({scoped: false}) // to maintain tab selection state
export class Home {
  // private cardIndex = 0;
  // private dealType:DealType = "open";
  // private dealsLoading = false;
  // static MAX_DEALS_COUNT=10;
  //
  // constructor(
  //   private router: Router,
  //   private dealService: DealService,
  // ) {
  // }
  //
  // @computedFrom("dealService.openProposals", "dealService.partneredDeals")
  // private get allDeals(): Record<"open" | "partnered", Array<DealTokenSwap>> {
  //   return {
  //     open: this.dealService.openProposals.slice(0, Home.MAX_DEALS_COUNT),
  //     partnered: this.dealService.partneredDeals.slice(0, Home.MAX_DEALS_COUNT),
  //   };
  // }
  //
  // @computedFrom("allDeals", "dealType")
  // private get featuredDeals(): Array<DealTokenSwap> {
  //   return this.allDeals[this.dealType].slice(0, 10).filter((deal: DealTokenSwap) => !deal.isCancelled && !deal.isFailed);
  // }
  //
  // async attached(): Promise<void> {
  //   this.dealsLoading = true;
  //   await this.dealService.ensureAllDealsInitialized();
  //   this.dealsLoading = false;
  //
  //   if (this.cardIndex === undefined) {
  //     this.cardIndex = this.allDeals.open.length ? 0 : 1;
  //   }
  // }
  //
  // dealToggle(index: number, type: "open" | "partnered"): void {
  //   this.dealType = type;
  //   this.cardIndex = index;
  // }
  //
  // navigate(href: string): void {
  //   this.router.navigate(href);
  // }
}
