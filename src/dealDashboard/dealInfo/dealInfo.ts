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
    this.timeLeftToExecute = this.getTimeLeftToExecute();
    this.timeLeftToExecuteInterval = window.setInterval(() => {
      this.timeLeftToExecute = this.getTimeLeftToExecute();
    }, 1000);
    this.deal.loadDealSize();
  }

  getSocialMediaDetails(socialMediaName: string) {
    return availableSocialMedias.find(socialMedia => socialMedia.name === socialMediaName);
  }

  getTimeLeftToExecute(): number | undefined {
    if (!this.deal.executedAt) {
      return;
    }
    return this.deal.executedAt.getTime() + this.deal.executionPeriod * 1000 - new Date().getTime();
  }

  detached() {
    clearInterval(this.timeLeftToExecuteInterval);
  }
}
