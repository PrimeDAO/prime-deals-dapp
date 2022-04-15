import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, computedFrom, ICollectionObserverSplice } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { DealService } from "../services/DealService";
import "./dealDashboard.scss";
import { Router } from "aurelia-router";
import { AureliaHelperService } from "../services/AureliaHelperService";
import { DisposableCollection } from "../services/DisposableCollection";

@autoinject
export class DealDashboard {
  private deal: DealTokenSwap;
  private discussionId: string = null;
  private dealId: string;
  private subscriptions = new DisposableCollection();

  constructor(
    private ethereumService: EthereumService,
    private dealService: DealService,
    private router: Router,
    private aureliaHelperService: AureliaHelperService,
    private eventAggregator: EventAggregator,
  ) {
  }

  @computedFrom("deal.isUserRepresentativeOrLead", "deal.isPrivate", "ethereumService.defaultAccount")
  private get isAllowedToDiscuss(): boolean {
    return (this.deal.isUserRepresentativeOrLead) || (!this.deal.isPartnered && !!this.ethereumService.defaultAccountAddress);
  }

  public async canActivate(params: { id: string }): Promise<void> {
    await this.dealService.ensureInitialized();
    this.checkUserCanAccessDashboard(params.id);
  }

  public async activate(params: { id: string }) {
    this.deal = this.dealService.deals.get(params.id);
    await this.deal.ensureInitialized();
    this.subscriptions.push(this.aureliaHelperService.createCollectionWatch(this.dealService.deals,
      (_splices: Array<ICollectionObserverSplice<Map<string, DealTokenSwap>>>) => {
        this.checkUserCanAccessDashboard(this.deal.id);
      }));
  }

  public deactivate() {
    this.subscriptions.dispose();
  }

  public checkUserCanAccessDashboard(dealId: string): void {
    // a deal entity going from public to private will disappear from the deals map
    if (!this.dealService.deals.has(dealId)) {
      this.eventAggregator.publish("handleInfo", "The deal you were viewing has become private");
      this.router.navigate("home");
    }
  }

}
