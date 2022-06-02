import { bindable, DialogDeactivationStatuses, IEventAggregator } from "aurelia";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { AlertService } from "../../services/AlertService";

export class DealMenubar {
  @bindable deal: DealTokenSwap;

  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
    private alertService: AlertService,
  ) {
  }

  copyURL() {
    navigator.clipboard.writeText(location.href);
    this.eventAggregator.publish("handleInfo", "Deal URL copied");
  }

  get canEdit() {
    return this.deal.isAuthenticatedProposalLead
      && !this.deal.isCancelled
      && !this.deal.isExecuted
      && !this.deal.isFunding
      && !this.deal.isFailed;
  }

  get canCancel() {
    return this.deal.isAuthenticatedProposalLead
      && !this.deal.fundingWasInitiated
      && !this.deal.isCancelled;
  }

  async cancelDeal() {
    const result = await this.alertService.showAlert({
      header: "You will be cancelling the deal and will not be able to re-activate it.",
      message: "Are you sure you want to cancel your deal?",
      buttons: 3,
      buttonTextPrimary: "Cancel My Deal",
      buttonTextSecondary: "Keep my deal",
    });

    if (result.status === DialogDeactivationStatuses.Cancel) {
      return;
    }

    this.eventAggregator.publish("deal.cancelling", true);
    try {
      await this.deal.close();
      this.eventAggregator.publish("handleInfo", "Your deal was successfully cancelled");
    } finally {
      this.eventAggregator.publish("deal.cancelling", false);
    }
  }

}
