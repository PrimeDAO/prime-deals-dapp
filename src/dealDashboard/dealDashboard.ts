import { autoinject, computedFrom } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { DealService } from "../services/DealService";
import "./dealDashboard.scss";
import { Router } from "aurelia-router";
import { AureliaHelperService } from "../services/AureliaHelperService";
import { DisposableCollection } from "../services/DisposableCollection";
import { AureliaHelperService } from "services/AureliaHelperService";

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
  ) {
  }

  @computedFrom("deal.isUserRepresentativeOrLead", "deal.isPrivate", "ethereumService.defaultAccount")
  private get isAllowedToDiscuss(): boolean {
    return (this.deal.isUserRepresentativeOrLead) || (!this.deal.isPartnered && !!this.ethereumService.defaultAccountAddress);
  }

  public async canActivate(params: { id: string }): Promise<void> {
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(params.id);
    await this.deal.ensureInitialized();
    this.checkUserCanAccessDashboard();
  }

  public async activate() {

    this.subscriptions.push(this.aureliaHelperService.createPropertyWatch(this.dealService, "deals", () => {
      this.checkUserCanAccessDashboard();
    }));

    this.subscriptions.push(this.aureliaHelperService.createPropertyWatch(this.deal, "isPrivate", () => {
      this.checkUserCanAccessDashboard();
    }));
  }

  public deactivate() {
    this.subscriptions.dispose();
  }

  public checkUserCanAccessDashboard(): void {
    // a deal entity going from public to private will disappear from the deals map
    if (!this.dealService.deals.has(this.deal.id) && (!this.deal.isPrivate || this.deal.isRepresentativeUser || this.deal.isUserProposalLead)) {
      this.router.navigate("home");
    }
  }

}
