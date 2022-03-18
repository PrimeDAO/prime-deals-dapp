import { autoinject, computedFrom } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { DealService } from "../services/DealService";
import "./dealDashboard.scss";

@autoinject
export class DealDashboard {
  private deal: DealTokenSwap;
  private discussionId?: string;
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
      [
        this.deal.registrationData.proposalLead?.address,
        ...this.deal.registrationData.primaryDAO?.representatives.map(representative => representative.address) || "",
        ...this.deal.registrationData.partnerDAO?.representatives.map(representative => representative.address) || "",
      ].includes(this.ethereumService.defaultAccountAddress)
    );
  }

}
