import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealMenubar.scss";
import { EventAggregator } from "aurelia-event-aggregator";
import { AlertService } from "../../services/AlertService";

@autoinject
export class DealMenubar {
  @bindable deal: DealTokenSwap;

  constructor(
    private eventAggregator: EventAggregator,
    private alertService: AlertService,
  ) {
  }

  copyURL() {
    navigator.clipboard.writeText(location.href);
    this.eventAggregator.publish("handleInfo", "Deal URL copied");
  }

  @computedFrom("deal.status")
  get canEdit() {
    return !this.deal.isExecuted && !this.deal.isCancelled;
  }

  async cancelDeal() {
    const result = await this.alertService.showAlert({
      header: "You will be cancelling the deal and will not be able to re-activate it.",
      message: "Are you sure you want to cancel your deal?",
      buttons: 3,
      buttonTextPrimary: "Continue",
      buttonTextSecondary: "Keep my deal",
    });

    if (result.wasCancelled) {
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
