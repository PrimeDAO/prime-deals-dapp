import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { availableSocialMedias } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import "./dealInfo.scss";

@autoinject
export class DealInfo {
  @bindable deal: DealTokenSwap;

  getSocialMediaDetails(socialMediaName: string) {
    return availableSocialMedias.find(socialMedia => socialMedia.name === socialMediaName);
  }
}
