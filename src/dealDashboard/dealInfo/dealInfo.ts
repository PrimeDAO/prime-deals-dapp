import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { availableSocialMedias } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import "./dealInfo.scss";
import { EthereumService } from "../../services/EthereumService";

@autoinject
export class DealInfo {
  @bindable deal: DealTokenSwap;

  timeLeftToExecute?: number;
  timeLeftToExecuteInterval?: number;

  constructor(public ethereumService: EthereumService) {
  }

  attached() {
    this.timeLeftToExecute = this.deal.timeLeftToExecute;
    this.timeLeftToExecuteInterval = window.setInterval(() => {
      this.timeLeftToExecute = this.deal.timeLeftToExecute;
    }, 1000);
    this.deal.loadDealSize();
  }

  getSocialMediaDetails(socialMediaName: string) {
    return availableSocialMedias.find(socialMedia => socialMedia.name === socialMediaName);
  }

  detached() {
    clearInterval(this.timeLeftToExecuteInterval);
  }
}
