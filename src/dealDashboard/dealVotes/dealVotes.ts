import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealVotes.scss";
import { Router } from "aurelia-router";
import { EthereumService } from "../../services/EthereumService";
import { AlertService } from "../../services/AlertService";

@autoinject
export class DealVotes {
  @bindable deal: DealTokenSwap;

  fundingModal: HTMLElement;

  constructor(
    private router: Router,
    public ethereumService: EthereumService,
    public alertService: AlertService,
  ) {
  }

  async fund() {
    const result = await this.alertService.showAlert({
      header: "Start Funding Phase",
      message: this.fundingModal.innerHTML,
      buttons: 3,
      buttonTextPrimary: "Continue",
      buttonTextSecondary: "Go back",
    });

    if (result.wasCancelled) {
      return;
    }

    this.router.navigate(`fund/${this.deal.id}`);
  }
}
