import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { availableSocialMedias } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import "./dealInfo.scss";
import { EthereumService } from "../../services/EthereumService";

@autoinject
export class DealInfo {
  @bindable deal: DealTokenSwap;

  constructor(public ethereumService: EthereumService) {
  }

  attached() {
    this.deal.loadDealSize();
  }

  getSocialMediaDetails(socialMediaName: string) {
    return availableSocialMedias.find(socialMedia => socialMedia.name === socialMediaName);
  }
}
