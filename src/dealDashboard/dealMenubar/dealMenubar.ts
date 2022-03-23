import { autoinject, bindable } from "aurelia-framework";
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
    this.eventAggregator.publish("showMessage", "Deal URL copied");
  }

  closeDeal() {
    // We need to talk about this. There is no "onOK" property that handles custom logic when clicking the primary button
    this.alertService.showAlert({
      header: "You will be closing the deal and will not be able to re-activate it.",
      message: "Are you sure you want to close the deal?",
      buttons: 3,
      buttonTextPrimary: "Cancel",
      buttonTextSecondary: "Continue",
    });
  }

}
