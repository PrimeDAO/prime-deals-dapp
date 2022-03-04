import { EthereumService } from "services/EthereumService";
import { SortOrder } from "../../services/SortService";
import { DealService } from "services/DealService";
import { autoinject, singleton } from "aurelia-framework";
import { Router } from "aurelia-router";
import "./deals.scss";
// import { Deal } from "entities/Deal";
import { SortService } from "services/SortService";

@singleton(false)
@autoinject
export class Deals {

  featuredDeals: Array<any> = null;
  seeingMore = false;

  constructor(
    private router: Router,
    private ethereumService: EthereumService,
    private dealService: DealService,
  ) {
    this.sort("starts"); // sort order will be ASC
  }

  seeMore(yesNo: boolean): void {
    this.seeingMore = yesNo;
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

    // switch (columnName) {
    //   case "dealToken":
    //     this.sortEvaluator = (a: Deal, b: Deal) => SortService.evaluateString(a.dealTokenInfo.symbol, b.dealTokenInfo.symbol, this.sortDirection);
    //     break;
    //   case "fundingToken":
    //     this.sortEvaluator = (a: Deal, b: Deal) => SortService.evaluateString(a.fundingTokenInfo.symbol, b.fundingTokenInfo.symbol, this.sortDirection);
    //     break;
    //   case "type":
    //     this.sortEvaluator = (_a: Deal, _b: Deal) => 0;
    //     break;
    //   case "target":
    //     this.sortEvaluator = (a: Deal, b: Deal) => SortService.evaluateBigNumber(a.target, b.target, this.sortDirection);
    //     break;
    //   case "project":
    //     this.sortEvaluator = (a: Deal, b: Deal) => SortService.evaluateString(a.metadata?.general?.projectName, b.metadata?.general?.projectName, this.sortDirection);
    //     break;
    //   case "starts":
    //     this.sortEvaluator = (a: Deal, b: Deal) => SortService.evaluateDateTimeAsDate(a.startTime, b.startTime, this.sortDirection);
    //     break;
    //   case "cap":
    //     this.sortEvaluator = (a: Deal, b: Deal) => SortService.evaluateBigNumber(a.cap, b.cap, this.sortDirection);
    //     break;
    //   case "whitelist":
    //     this.sortEvaluator = (a: Deal, b: Deal) => SortService.evaluateBoolean(a.whitelisted, b.whitelisted, this.sortDirection);
    //     break;
    // }
  }

  // gotoEtherscan(deal: Deal, event: Event): boolean {
  //   Utils.goto(this.ethereumService.getEtherscanLink(deal.address));
  //   event.stopPropagation();
  //   return false;
  // }

  // onDealClick(deal: Deal): void {
  //   this.router.navigate(deal.canGoToDashboard ? `deal/${deal.address}` : "launches");
  // }
}
