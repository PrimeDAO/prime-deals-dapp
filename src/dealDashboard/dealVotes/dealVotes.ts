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

  fundingModal: HTMLElement;

  everyTextCopy = [
    {
      condition: () => !this.deal.majorityHasVoted && !this.deal.representativeVoted(this.ethereumService.defaultAccountAddress),
      voteText: "You’re eligible to vote. The deal will be approved once the majority accepts the deal",
      statusText: "Voting in progress",
    },
    {
      condition: () => !this.deal.majorityHasVoted && this.deal.representativeVoted(this.ethereumService.defaultAccountAddress) && this.deal.isTheProposalLead(this.ethereumService.defaultAccountAddress),
      voteText: "Please wait for the representatives to cast their votes. The representatives are able to change their votes before the funding phase is initiated. If the deal is approved, you can initiate the funding phase",
      statusText: "Voting in progress",
    },
    {
      condition: () => !this.deal.majorityHasVoted && this.deal.representativeVoted(this.ethereumService.defaultAccountAddress) && !this.deal.isTheProposalLead(this.ethereumService.defaultAccountAddress),
      voteText: "You have cast your vote. Please wait for other representatives to cast theirs. You are able to change your vote before the funding phase is initiated. If the deal is approved, the Proposal Lead will initiate the funding phase",
      statusText: "Voting in progress",
    },
    {
      condition: () => this.deal.majorityHasVoted && this.deal.representativeVoted(this.ethereumService.defaultAccountAddress) && this.deal.isTheProposalLead(this.ethereumService.defaultAccountAddress),
      voteText: "Deal is approved. Please go to the funding page to deposit your tokens",
      statusText: "Voting is completed. Funding in progress",
    },
    {
      condition: () => this.deal.majorityHasVoted && !this.deal.isTheProposalLead(this.ethereumService.defaultAccountAddress),
      voteText: "Deal is approved",
      statusText: "Voting is completed. Waiting for the proposal lead to initiate the funding phase",
    },
    {
      condition: () => this.deal.isFunding,
      voteText: "Deal is approved. Representatives can go to the funding page to deposit their tokens. Once completed, token swap can be executed",
      statusText: "Voting is completed. Funding in progress",
    },
  ];

  constructor(
    private router: Router,
    public ethereumService: EthereumService,
    private dialogService: DialogService,
  ) {
  }

  async fund() {
    const result = await this.dialogService.open(FundingModal, {deal: this.deal});

    if (result.wasCancelled) {
      return;
    }

    this.router.navigate(`fund/${this.deal.id}`);
  }

  goToDiscussions() {
    location.hash = "discussionsSection";
  }

  @computedFrom("deal.isVoting", "deal.majorityHasVoted", "deal.isFunding", "ethereumService.defaultAccountAddress")
  get statusText() {
    return this.everyTextCopy.find(textCopy => textCopy.condition());
  }
}
