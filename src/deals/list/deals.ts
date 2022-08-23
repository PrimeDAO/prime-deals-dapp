import { IEventAggregator, inject, singleton } from "aurelia";

import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { DateService } from "services/DateService";
import { DealService } from "services/DealService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { Address, IEthereumService } from "services/EthereumService";
import { SortOrder, SortService } from "services/SortService";
import { DisposableCollection } from "services/DisposableCollection";
import { IRouter } from "@aurelia/router";

/**
 * This is the view model for the deals page
 */
@singleton(/*{scoped: false}*/)
@inject()
export class Deals {

  private cardIndex;
  private seeingMore = false;
  private showMine = false;
  private dealsLoading = false;
  private sortColumn: string;
  private sortDirection = SortOrder.DESC;
  private sortEvaluator: (a: DealTokenSwap, b: DealTokenSwap) => number;
  private subscriptions = new DisposableCollection();

  constructor(
    private dealService: DealService,
    @IEventAggregator private eventAggregator: IEventAggregator,
    private dateService: DateService,
    @IEthereumService private ethereumService: IEthereumService,
    @IDataSourceDeals private dataSourceDeals: IDataSourceDeals,
    @IRouter private router: IRouter,
  ) {
    //
  }

  /**
   * Provides a filtered list of deals based off of certain conditions and toggles on the deal page
   */
  public get featuredDeals(): DealTokenSwap[] {
    return this.gridDeals?.slice(0, 10).filter((deal: DealTokenSwap) => !deal.isCancelled && !deal.isFailed);
  }

  // TODO: make this more efficient with some kind of debouncer or fewer dependencies
  public get gridDeals(): DealTokenSwap[] {
    return this.getDealsForCardIndex(this.cardIndex, this.showMine, this.ethereumService.defaultAccountAddress);
  }

  public async attached(): Promise<void> {
    this.dealsLoading = true;
    await this.dealService.ensureAllDealsInitialized();
    this.dealsLoading = false;

    if (this.cardIndex === undefined) {
      this.cardIndex = this.dealService.openProposals?.length ? 1 : 0;
    }
    this.sortDirection = SortOrder.DESC;
    this.sort("age");

    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", (account: Address) => {
      if (!account) {
        this.showMine = false;
      }
    }));
  }

  public detaching(): void {
    this.subscriptions.dispose();
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

  private getDealsForCardIndex(cardIndex: number, showMine: boolean, address: string): DealTokenSwap[] {
    if (cardIndex === undefined) {
      return [];
    }

    const deals = cardIndex === 0 ? this.dealService.openProposals : this.dealService.partneredDeals;

    return this.filterDeals(deals, showMine, address);
  }

  get allDeals(): DealTokenSwap[] {
    const deals = this.dealService.openProposals.concat(this.dealService.partneredDeals);

    const address = this.ethereumService.defaultAccountAddress;
    return this.filterDeals(deals, this.showMine, address);
  }

  private filterDeals(deals: DealTokenSwap[], showMine: boolean, address: string) {
    return showMine
      ? deals.filter((x: DealTokenSwap) =>
        x.registrationData.proposalLead?.address === address
        || x.registrationData.primaryDAO?.representatives.some(y => y.address === address)
        || x.registrationData.partnerDAO?.representatives.some(y => y.address === address),
      )
      : deals;
  }

  /**
   * If there are no deals to be shown on the tab then it will be hidden.
   * @param cardIndex The curren tab
   * @param showMine The toggle of deals to show
   * @returns
   */
  private isTabVisible(cardIndex: number, showMine: boolean, address: string): boolean {
    return !!this.getDealsForCardIndex(cardIndex, showMine, address)?.length;
  }

  /**
   * Flips the toggle for whether or not deals for user are shown and also checks visbility
   */
  private toggleMyDeals(): void {
    this.showMine = !this.showMine;
    if (this.showMine) {
      //if showing only "my deals" check to see which tab to display by default if there are no deals in either tab
      const hasPartneredDeals = this.isTabVisible(1, this.showMine, this.ethereumService.defaultAccountAddress);
      const hasOpenProposals = this.isTabVisible(0, this.showMine, this.ethereumService.defaultAccountAddress);
      if (this.cardIndex === 0 && !hasOpenProposals) {
        this.cardIndex = 1;
      }
      if (this.cardIndex === 1 && !hasPartneredDeals) {
        this.cardIndex = 0;
      }
    }
  }

}
