import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealMakeAnOffer.scss";
import { AlertService } from "../../services/AlertService";
import { Router } from "aurelia-router";

@autoinject
export class DealMakeAnOffer {
  @bindable deal: DealTokenSwap;

  makeAnOfferModal: HTMLElement

  constructor(
    private alertService: AlertService,
    private router: Router
  ) {
  }

  async makeAnOffer() {
    const result = await this.alertService.showAlert({
      header: "Make an offer",
      message: this.makeAnOfferModal.innerHTML,
      buttons: 3,
      buttonTextPrimary: "Continue",
      buttonTextSecondary: "Cancel",
    })

    if (result.wasCancelled) {
      return;
    }

    this.router.navigate(`/make-an-offer/${this.deal.id}/partner-dao`)
  }
}
