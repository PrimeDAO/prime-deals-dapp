import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealMenubar.scss";
import { EventAggregator } from "aurelia-event-aggregator";
import { AlertService } from "../../services/AlertService";
import { DealStatus } from "../../entities/IDealTypes";

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
    this.eventAggregator.publish("showMessage", "Deal URL copied");
  }

  @computedFrom("deal.status")
  get canEdit() {
    return ![DealStatus.funding, DealStatus.swapping].includes(this.deal.status);
  }

  async closeDeal() {
    const result = await this.alertService.showAlert({
      header: "You will be closing the deal and will not be able to re-activate it.",
      message: "Are you sure you want to close the deal?",
      buttons: 3,
      buttonTextPrimary: "Continue",
      buttonTextSecondary: "Cancel",
    });

    if (result.wasCancelled) {
      return;
    }

    this.eventAggregator.publish("deal.closing", true);
    try {
      await this.deal.close();
      this.eventAggregator.publish("handleInfo", "Your deal was successfully closed");
    } finally {
      this.eventAggregator.publish("deal.closing", false);
    }
  }

}
