import { DealTokenSwap } from "entities/DealTokenSwap";
import { AlertService } from "../../services/AlertService";
import { bindable, DialogDeactivationStatuses } from "aurelia";
import {IRouter} from "@aurelia/router";

export class DealMakeAnOffer {
  @bindable deal: DealTokenSwap;

  makeAnOfferModal: HTMLElement;

  constructor(
    private alertService: AlertService,
    @IRouter private router: IRouter,
  ) {
  }

  async makeAnOffer() {
    const result = await this.alertService.showAlert({
      header: "Make an offer",
      message: this.makeAnOfferModal.innerHTML,
      buttons: 3,
      buttonTextPrimary: "Continue",
      buttonTextSecondary: "Cancel",
    });

    if (result.status === DialogDeactivationStatuses.Cancel) {
      return;
    }

    this.router.load(`/make-an-offer/${this.deal.id}/partner-dao`);
  }
}
