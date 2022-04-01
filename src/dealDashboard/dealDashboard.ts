import { autoinject, computedFrom } from "aurelia-framework";
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

  async activate(_, __, navigationInstruction) {
    this.dealId = navigationInstruction.params.address;
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    await this.deal.ensureInitialized();
  }

  @computedFrom("ethereumService.defaultAccountAddress", "deal.registrationData")
  get authorized(): boolean {
    return (
      this.ethereumService.defaultAccountAddress &&
      (
        /* Open deal can not be private, and anyone can comment and begin a discussion */
        this.deal.isOpenProposal ||
        /* In a Partnered deal only members can comment and begin a discussion */
        this.deal.isUserRepresentativeOrLead
      )
    );
  }
}
