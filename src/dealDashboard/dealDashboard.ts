import { autoinject } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { DealService } from "services/DealService";
import "./dealDashboard.scss";

@autoinject
export class DealDashboard {
  private deal: DealTokenSwap;
  private discussionId: string = null;
  private dealId: string;

  constructor(
    private ethereumService: EthereumService,
    private dealService: DealService,
  ) {
  }

  public async canActivate(params: { address: string }): Promise<boolean> {
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(params.address);
    await this.deal.ensureInitialized();
    return !this.deal.isPrivate || this.deal.isRepresentativeUser || this.deal.isUserProposalLead;
  }
}
