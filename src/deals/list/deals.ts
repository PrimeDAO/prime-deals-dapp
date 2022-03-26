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
/**
 * This is the view model for the deals page
 */
@singleton(false)
@autoinject
export class Deals {

  private cardIndex = 0;
  private seeingMore = false;
  private showMine = false;
  private sortColumn: string;
  private sortDirection = SortOrder.DESC;
  private sortEvaluator: (a: DealTokenSwap, b: DealTokenSwap) => number;

  constructor(
    private readonly dealService: DealService,
    private eventAggregator: EventAggregator,
    private dateService: DateService,
    private ethereumService: EthereumService,
  ) {
  }
  /**
   * Provides a filtered list of deals based off of certain conditions and toggles on the deal page
   */
  @computedFrom("gridDeals")
  public get featuredDeals(): DealTokenSwap[] {
    return this.gridDeals.slice(0, 10);
  }

  @computedFrom("cardIndex", "showMine", "ethereumService.defaultAccountAddress", "dealService.openProposals", "dealService.partneredDeals")
  public get gridDeals(): DealTokenSwap[] {
    return this.getDealsForCardIndex(this.cardIndex, this.showMine, this.ethereumService.defaultAccountAddress);
  }

  public async attached(): Promise<void> {
    if (!dealsLoadedOnce) {
      await this.dealService.ensureAllDealsInitialized();
      this.cardIndex = this.dealService.openProposals?.length ? 0 : 1;
      this.sortDirection = SortOrder.DESC;
      this.sort("age");
      // eslint-disable-next-line require-atomic-updates
      dealsLoadedOnce = true;
    }
  }

  /**
   * Switches the tab index which is open/partner deals
   * @param index The tab Index
   */
  public dealToggle(index: number): void {
    this.cardIndex = index;
  }

  /**
   * Returns a relative time with a custom replacer
   * @param dateTime
   * @returns
   */
  public getFormattedTime(dateTime: Date): string {
    return this.dateService.formattedTime(dateTime).diff("en-US", false).replace("a ", "1 ");
  }

  /**
   * @param deal
   * @returns
   */
  public getPrice(deal: DealTokenSwap): string | number {
    return deal.totalPrice === 0 ? "N/A" : deal.totalPrice;
  }

  /**
   * This allows for more deals to be displayed on the deal page grid
   * @param yesNo
   */
  public seeMore(yesNo: boolean): void {
    this.seeingMore = yesNo;
  }

  /**
   * Sorts the current featured deals based on the current selector
   * @param columnName
   */
  public sort(columnName: string): void {
    if (this.sortColumn === columnName) {
      this.sortDirection = SortService.toggleSortOrder(this.sortDirection);
    } else {
      this.sortColumn = columnName;
    }

    switch (columnName) {
      case "daos":
        this.sortEvaluator = (a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateString(a.registrationData.primaryDAO.name, b.registrationData.primaryDAO.name, this.sortDirection);
        break;
      case "title":
        this.sortEvaluator = (a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateString(a.registrationData.proposal.title, b.registrationData.proposal.title, this.sortDirection);
        break;
      case "type":
        this.sortEvaluator = (_a: DealTokenSwap, _b: DealTokenSwap) => 0;
        break;
      case "status":
        this.sortEvaluator = (a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateString(a.status, b.status, this.sortDirection);
        break;
      case "age":
        this.sortEvaluator = (a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateDateTimeAsDate(a.createdAt, b.createdAt, this.sortDirection);
        break;
      case "dealSize":
        this.sortEvaluator = (a: DealTokenSwap, b: DealTokenSwap) => SortService.evaluateNumber(a.totalPrice, b.totalPrice, this.sortDirection);
        break;
    }
  }

  /**
   * Returns a filtered set of deals based on criteria being passed in from the deal service
   * @param cardIndex The current Tab
   * @param showMine Whether or not to show your current deals
   * @returns
   */
  private getDealsForCardIndex(cardIndex: number, showMine: boolean, address: string) : DealTokenSwap[] {
    if (cardIndex === 0) {
      //open proposals
      return !showMine ? this.dealService.openProposals : this.dealService.openProposals.filter((x: DealTokenSwap) => x.registrationData.proposalLead?.address === address || x.registrationData.primaryDAO?.representatives.some(y => y.address === address));
    }
    //partnered deals
    const deals = !showMine ? this.dealService.partneredDeals : this.dealService.partneredDeals.filter((x: DealTokenSwap) => x.registrationData.proposalLead?.address === address || x.registrationData.primaryDAO?.representatives.some(y => y.address === address) || x.registrationData.partnerDAO?.representatives.some(y => y.address === address));
    deals.forEach(y => {
      if (y.totalPrice) return;
      y.loadDealSize();
    });
    return deals;
  }

  /**
   * If there are no deals to be shown on the tab then it will be hidden.
   * @param cardIndex The curren tab
   * @param showMine The toggle of deals to show
   * @returns
   */
  private isTabVisible(cardIndex: number, showMine: boolean, address: string) : boolean {
    return !!this.getDealsForCardIndex(cardIndex, showMine, address)?.length;
  }

  /**
   * Flips the toggle for whether or not deals for user are shown and also checks visbility
   */
  private toggleMyDeals(): void {
    this.showMine = !this.showMine;
    if (!this.isTabVisible(0, this.showMine, this.ethereumService.defaultAccountAddress)) {
      this.cardIndex = 1;
    }
  }

}
