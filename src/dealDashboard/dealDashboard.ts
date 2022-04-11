import { autoinject, computedFrom } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { DealService } from "../services/DealService";
import "./dealDashboard.scss";
import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";
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
    private eventAggregator: EventAggregator,
    private router: Router,
  ) {
  }

  @computedFrom("deal.isUserRepresentativeOrLead", "deal.isPrivate", "ethereumService.defaultAccount")
  private get isAllowedToDiscuss(): boolean {
    return (this.deal.isUserRepresentativeOrLead) || (!this.deal.isPartnered && !!this.ethereumService.defaultAccountAddress);
  }

  public async canActivate(params: { address: string }): Promise<boolean> {
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(params.address);
    await this.deal.ensureInitialized();
    return this.userCanAccessDashboard;
  }

  public async activate() {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", () => {
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
