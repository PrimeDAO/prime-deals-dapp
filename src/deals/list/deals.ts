import { EventType } from "./../../services/constants";
import "./deals.scss";

import { autoinject, computedFrom, singleton } from "aurelia-framework";

import { DateService } from "services/DateService";
import { DealService } from "services/DealService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { EthereumService } from "services/EthereumService";
import { EventAggregator } from "aurelia-event-aggregator";
import { SortOrder } from "../../services/SortService";
import { SortService } from "services/SortService";

let dealsLoadedOnce = false;

@singleton(false)
@autoinject
export class Deals {
  cardIndex = 0;
  seeingMore = false;
  showMine = false;
  constructor(
    private readonly dealService: DealService,
    private eventAggregator: EventAggregator,
    private dateService: DateService,
    private ethereumService: EthereumService,
  ) {

  }

  attached(): void {
    if (dealsLoadedOnce) return;
    this.dealService.ensureAllDealsInitialized();
    this.cardIndex = this.dealService.openProposals?.length ? 0 : 1;
    this.sortDirection = SortOrder.DESC;
    this.sort("age");
    dealsLoadedOnce = true;
  }

  @computedFrom("cardIndex", "showMine")
  get featuredDeals(): DealTokenSwap[] {
    return [...this.getDealsForCardIndex(this.cardIndex, this.showMine)];
  }
  seeMore(yesNo: boolean): void {
    this.seeingMore = yesNo;
  }
  dealToggle(index: number): void {
    this.cardIndex = index;
  }
  private toggleMyDeals(): void {
    this.showMine = !this.showMine;
    if (!this.isTabVisible(0, this.showMine)) {
      this.cardIndex = 1;
    }
  }

  getFormattedTime(dateTime: Date): string {
    return this.dateService.formattedTime(dateTime).diff("en-US").replace("a ", "1 ");
  }

  getPrice(deal: DealTokenSwap) : string | number {
    return deal.totalPrice === 0 ? "N/A" : deal.totalPrice;
  }

  private onConnect(): void {
    this.eventAggregator.publish(EventType.AccountConnect);
  }
  sortDirection = SortOrder.DESC;
  sortColumn: string;
  sortEvaluator: (a: any, b: any) => number;
  sort(columnName: string): void {

    if (this.sortColumn === columnName) {
      this.sortDirection = SortService.toggleSortOrder(this.sortDirection);
    } else {
      this.sortColumn = columnName;
    }

    switch (columnName) {
      case "type":
        this.sortEvaluator = (_a: DealTokenSwap, _b: DealTokenSwap) => 0;
        break;
      case "status":
        this.sortEvaluator = (a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateString(a.status, b.status, this.sortDirection);
        break;
      case "age":
        this.sortEvaluator = (a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateDateTimeAsDate(a.registrationData.createdAt, b.registrationData.createdAt, this.sortDirection);
        break;
      case "dealSize":
        this.sortEvaluator = (a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateString(a.registrationData.dealType, b.registrationData.dealType, this.sortDirection);
        break;
    }
  }
  private isTabVisible(cardIndex: number, showMine: boolean) {
    return !!this.getDealsForCardIndex(cardIndex, showMine)?.length;
  }
  private getDealsForCardIndex(cardIndex: number, showMine: boolean) {
    if (cardIndex === 0) {
      //open proposals
      return !showMine ? this.dealService.openProposals : this.dealService.openProposals.filter((x: DealTokenSwap) => x.registrationData.proposalLead?.address === this.ethereumService.defaultAccountAddress || x.registrationData.primaryDAO?.representatives.some(y => y.address === this.ethereumService.defaultAccountAddress));
    }

    //partnered deals
    const deals = !showMine ? this.dealService.partneredDeals : this.dealService.partneredDeals.filter((x: DealTokenSwap) => x.registrationData.proposalLead?.address === this.ethereumService.defaultAccountAddress || x.registrationData.primaryDAO?.representatives.some(y => y.address === this.ethereumService.defaultAccountAddress) || x.registrationData.partnerDAO?.representatives.some(y => y.address === this.ethereumService.defaultAccountAddress));
    deals.forEach(y => {
      if (y.totalPrice) return;
      y.loadDealSize();
    });
    return deals;

  }

}
