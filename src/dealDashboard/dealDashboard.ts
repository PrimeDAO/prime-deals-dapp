import { Router } from "aurelia-router";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { DealService } from "services/DealService";
import { DisposableCollection } from "services/DisposableCollection";
import "./dealDashboard.scss";

@autoinject
export class DealDashboard {
  private deal: DealTokenSwap;
  private discussionId: string = null;
  private dealId: string;
  private subscriptions = new DisposableCollection();

  constructor(
    private ethereumService: EthereumService,
    private dealService: DealService,
    private disposableCollection: DisposableCollection,
    private eventAggregator: EventAggregator,
    private router: Router,
  ) {
  }

  public async canActivate(params: { address: string }): Promise<boolean> {
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(params.address);
    await this.deal.ensureInitialized();
    return this.userCanAccessDashboard;
  }

  public activate() {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", async (): Promise<void> => {
      if (!this.userCanAccessDashboard) {
        this.router.navigate("home");
      }
    }));
  }

  public detached() {
    this.subscriptions.dispose();
  }

  public get userCanAccessDashboard(): boolean {
    return !this.deal.isPrivate || this.deal.isRepresentativeUser || this.deal.isUserProposalLead;
  }
}
