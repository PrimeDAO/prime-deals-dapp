import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealVotes.scss";
import { Router } from "aurelia-router";
import { EthereumService } from "../../services/EthereumService";
import { FundingModal } from "./fundingModal/fundingModal";
import { DialogService } from "../../services/DialogService";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class DealVotes {
  @bindable deal: DealTokenSwap;

  accepting = false;
  declining = false;

  everyTextCopy = [
    {
      condition: () => this.deal.isFunding,
      voteText: "Deal is approved. Representatives can go to the funding page to deposit their tokens. Once completed, token swap can be executed",
      statusText: "Voting is completed. Funding in progress",
    },
    {
      condition: () => this.deal.isProposalLeadWaitingForOthersToVote,
      voteText: "Please wait for the representatives to cast their votes. The representatives are able to change their votes before the funding phase is initiated. If the deal is approved, you can initiate the funding phase",
      statusText: "Voting in progress",
    },
    {
      condition: () => this.deal.isRepresentativeEligibleToVote,
      voteText: "You’re eligible to vote. The deal will be approved once the majority accepts the deal",
      statusText: "Voting in progress",
    },
    {
      condition: () => this.deal.isRepresentativeWaitingForOthersToVote,
      voteText: "You have cast your vote. Please wait for other representatives to cast theirs. You are able to change your vote before the funding phase is initiated. If the deal is approved, the Proposal Lead will initiate the funding phase",
      statusText: "Voting in progress",
    },
    {
      condition: () => this.deal.canStartFunding,
      voteText: "Deal is approved. Please go to the funding page to deposit your tokens",
      statusText: "Voting is completed. Funding in progress",
    },
    {
      condition: () => this.deal.waitingForTheProposalLeadToStartFunding,
      voteText: "Deal is approved",
      statusText: "Voting is completed. Waiting for the proposal lead to initiate the funding phase",
    },
  ];

  constructor(
    private router: Router,
    private eventAggregator: EventAggregator,
    public ethereumService: EthereumService,
    private dialogService: DialogService,
  ) {
  }

  async fund() {
    const result = await this.dialogService.open(FundingModal, {deal: this.deal});

    if (result.wasCancelled) {
      return;
    }

    await this.deal.createSwap();

    this.goToFunding();
  }

  goToFunding() {
    this.router.navigate(`funding/${this.deal.id}`);
  }

  goToDiscussions() {
    location.hash = "discussionsSection";
  }

  @computedFrom("deal.isVoting", "deal.majorityHasVoted", "deal.isFunding", "ethereumService.defaultAccountAddress")
  get statusText() {
    return this.everyTextCopy.find(textCopy => textCopy.condition());
  }

  async acceptDeal() {
    this.accepting = true;
    await this.vote(true).finally(() => this.accepting = false);
  }

  async declineDeal() {
    this.declining = true;
    await this.vote(true).finally(() => this.declining = false);
  }

  private async vote(value: boolean) {
    try {
      await this.deal.vote(value);
      this.eventAggregator.publish("showMessage", "Your vote has been successfully submitted");
    } catch (error) {
      console.log("Voting error", error);
      this.eventAggregator.publish("handleFailure", "Sorry, an error occurred submitting your vote");
    }
  }
}
