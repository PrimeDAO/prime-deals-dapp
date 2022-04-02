import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealVotes.scss";
import { Router } from "aurelia-router";
import { EthereumService } from "../../services/EthereumService";
import { FundingModal } from "./fundingModal/fundingModal";
import { DialogService } from "../../services/DialogService";

@autoinject
export class DealVotes {
  @bindable deal: DealTokenSwap;

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
    public ethereumService: EthereumService,
    private dialogService: DialogService,
    private eventAggregator: EventAggregator,
  ) {
  }

  async fund() {
    const result = await this.dialogService.open(FundingModal, {deal: this.deal});

    if (result.wasCancelled) {
      return;
    }

    try {
      await this.deal.createSwap();
      this.eventAggregator.publish("showMessage", "The funding phase is successfully started");
      this.goToFunding();
    } catch (ex) {
      this.eventAggregator.publish("showMessage", "Sorry, there was a problem starting the funding phase");
    }
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
}
