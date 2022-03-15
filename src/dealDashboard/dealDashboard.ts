import { Router } from "aurelia-router";
import { autoinject, computedFrom } from "aurelia-framework";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { DealService } from "services/DealService";
import { EthereumService, Address } from "services/EthereumService";
import { DiscussionsService } from "dealDashboard/discussionsService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { IClause } from "entities/DealRegistrationTokenSwap";
import "./dealDashboard.scss";

@autoinject
export class DealDashboard {
  private connected = false;
  private connectedAddress: Address;

  private routeChangeEvent: Subscription;

  private dealId: string;
  private deal: DealTokenSwap;
  private discussionId: string = null;

  private clauses: IClause[];

  @computedFrom("ethereumService.defaultAccountAddress", "deal.registrationData")
  get isPrivate(): boolean {
    return this.deal.registrationData.isPrivate;
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

  constructor(
    private ethereumService: EthereumService,
    private discussionsService: DiscussionsService,
    private eventAggregator: EventAggregator,
    private dealService: DealService,
    private router: Router,
  ) {
    this.connectedAddress = "";
    this.eventAggregator.subscribe("Network.Changed.Account", (account: Address): void => {
      if (account !== this.connectedAddress) {
        this.connectedAddress = account;
      }
    });
  }

  async activate(_, __, navigationInstruction) {
    this.dealId = navigationInstruction.params.address;
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(this.dealId);
    await this.deal.ensureInitialized();
    this.clauses = this.deal.registrationData.terms.clauses;
  }

  accountAddressChanged(newAddress: Address){
    this.connected = this.deal && ([
      this.deal.registrationData.proposalLead,
      ...this.deal.registrationData.primaryDAO.representatives.map(representative => representative.address),
      ...this.deal.registrationData.partnerDAO.representatives.map(representative => representative.address),
    ].includes(newAddress));
  }

  /**
   * Adds a new discussion thread to the deal
   * (Currently saves the thread to the local storage- this should be replaced with a data-storage call)
   *
   * @param topic the discussion topic
   * @param id the id of the clause the discussion is for or null if it is a general discussion
   */
  private async addOrReadDiscussion (topic: string, discussionHash: string, clauseHash: string | null, clauseIndex: number | null): Promise<void> {
    this.discussionId = discussionHash || // If no discussion hash provided- create a new discussion
      await this.discussionsService.createDiscussion(
        this.dealId,
        {
          topic,
          clauseHash,
          clauseIndex,
          admins: [this.ethereumService.defaultAccountAddress],
          representatives: [{address: this.ethereumService.defaultAccountAddress}],
          isPublic: true,
        },
      );
  }

  private goto(fragment: string) {
    this.router.navigate(fragment);
  }
}
