import { autoinject, computedFrom } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { MobileService } from "services/MobileService";
import "./dealDescription.scss";

const MOBILE_MAX_LENGTH = 250;

@autoinject
export class DealDescription {
  @bindable deal: DealTokenSwap;

  /**
   * Description text is shortened to 250 words
   */
  private descriptionText: string | undefined;
  private originalDescriptionText = "";

  @computedFrom("descriptionText")
  get showReadMoreButton() {
    return this.descriptionText.length < this.originalDescriptionText.length;
  }

  bind() {
    this.originalDescriptionText = this.deal.registrationData.proposal.description;

    if (MobileService.isMobile()) {
      if (this.originalDescriptionText.length > MOBILE_MAX_LENGTH) {
        const shortened = this.originalDescriptionText.substring(0, MOBILE_MAX_LENGTH);
        this.descriptionText = `${shortened}...`;
      }
    }

    if (this.descriptionText === undefined) {
      this.descriptionText = this.originalDescriptionText;
    }
  }

  private readMore(): void {
    this.descriptionText = `${this.originalDescriptionText}`;
  }
}
