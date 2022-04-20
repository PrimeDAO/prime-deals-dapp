import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealVotes.scss";
import { Router } from "aurelia-router";
import { EthereumService } from "../../services/EthereumService";
import { FundingModal } from "./fundingModal/fundingModal";
import { DialogService } from "../../services/DialogService";
import { ConsoleLogService } from "../../services/ConsoleLogService";
import { EventConfigException } from "services/GeneralEvents";
import { Utils } from "services/utils";

@autoinject
export class DealVotes {
  @bindable deal: DealTokenSwap;

  accepting = false;
  declining = false;

  everyTextCopy = [
    {
      condition: () => this.deal.isFunding,
      voteText: "Deal is approved. Representatives can go to the funding page to deposit their tokens. Once completed, the token swap can be executed",
      statusText: "Deal is approved",
    },
    {
      condition: () => !this.deal.majorityHasVoted && !this.deal.isRepresentativeUser && !this.deal.isUserProposalLead,
      voteText: "Waiting for the representatives to vote",
      statusText: "Voting is progress",
    },
    {
      condition: () => !this.deal.majorityHasVoted && this.deal.isRepresentativeUser && this.deal.hasRepresentativeVoted && !this.deal.isUserProposalLead,
      voteText: "You have cast your vote. Please wait for other representatives to cast theirs. You are able to change your vote before the funding phase is initiated. Once the deal is approved, the Proposal Lead will initiate the funding phase",
      statusText: "Voting in progress",
    },
    {
      condition: () => !this.deal.majorityHasVoted && this.deal.isRepresentativeUser && !this.deal.hasRepresentativeVoted && !this.deal.isUserProposalLead,
      voteText: "The deal will be approved once the majority has voted in favor. Once the deal is approved, the Proposal Lead will initiate the funding phase",
      statusText: "Voting in progress",
    },
    {
      condition: () => !this.deal.majorityHasVoted && this.deal.isUserProposalLead,
      voteText: "The deal will be approved once the majority has voted in favor. Once the deal is approved, you can initiate the funding phase",
      statusText: "Voting in progress",
    },
    {
      condition: () => this.deal.majorityHasVoted && this.deal.isRepresentativeUser && !this.deal.isUserProposalLead,
      voteText: "Waiting for the Proposal Lead to initiate the funding phase.  You may still change your vote if you wish to",
      statusText: "Voting is completed",
    },
    {
      condition: () => this.deal.majorityHasVoted && !this.deal.isRepresentativeUser && !this.deal.isUserProposalLead,
      voteText: "Waiting for the Proposal Lead to initiate the funding phase",
      statusText: "Voting is completed",
    },
    {
      condition: () => this.deal.majorityHasVoted && this.deal.isRepresentativeUser && this.deal.isUserProposalLead,
      voteText: "You can now initiate the funding phase. You may still change your vote if you wish to",
      statusText: "Voting is completed",
    },
    {
      condition: () => this.deal.majorityHasVoted && !this.deal.isRepresentativeUser && this.deal.isUserProposalLead,
      voteText: "You can now initiate the funding phase",
      statusText: "Voting is completed",
    },
  ];

  constructor(
    private router: Router,
    public ethereumService: EthereumService,
    private dialogService: DialogService,
    private eventAggregator: EventAggregator,
    private consoleLogService: ConsoleLogService,
  ) {
  }

  async fund() {
    const result = await this.dialogService.open(FundingModal, {deal: this.deal});

    if (result.wasCancelled) {
      return;
    }

    if (await this.deal.createSwap()) {
      await Utils.waitUntilTrue(() => !!this.deal.contractDealId); //have to await this so the contractDealId is populated before redirecting to the funding page
      this.eventAggregator.publish("handleInfo", "The funding phase is successfully started");
      this.goToFunding();
    }
    else {
      this.eventAggregator.publish("handleFailure", "Sorry, there was a problem starting the funding phase");
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

  async acceptDeal() {
    this.accepting = true;
    await this.vote(true).finally(() => this.accepting = false);
  }

  async declineDeal() {
    this.declining = true;
    await this.vote(false).finally(() => this.declining = false);
  }

  private async vote(value: boolean) {
    try {
      await this.deal.vote(value);
      this.eventAggregator.publish("handleInfo", "Your vote has been successfully submitted");
    } catch (error) {
      this.consoleLogService.logMessage(`Voting error ${error}`, "error");
      this.eventAggregator.publish("handleException", new EventConfigException("Sorry, an error occurred submitting your vote", error));
    }
  }
}
