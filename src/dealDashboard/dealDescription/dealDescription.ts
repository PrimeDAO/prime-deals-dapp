import { autoinject, computedFrom } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { MobileService } from "services/MobileService";
import "./dealDescription.scss";

const MOBILE_MAX_LENGTH = 250;

@autoinject
export class DealDescription {
  @bindable deal: DealTokenSwap;

  private resizeWatcher;
  private isMobile: boolean;
  private readingMore = false;

  /**
   * Description text is shortened to 250 words
   */
  @computedFrom("readingMore", "isMobile", "originalDescriptionText")
  private get descriptionText(): string {

    if (this.isMobile && !this.readingMore && (this.originalDescriptionText.length > MOBILE_MAX_LENGTH)) {
      const shortened = this.originalDescriptionText.substring(0, MOBILE_MAX_LENGTH);
      return `${shortened}...`;
    } else if (this.readingMore) {
      return `${this.originalDescriptionText}`;
    } else {
      return this.originalDescriptionText;
    }
  }

  @computedFrom("isMobile", "readingMore")
  get showReadMoreButton() {
    return this.isMobile && !this.readingMore;
  }

  @computedFrom("deal.registrationData.proposal.description")
  get originalDescriptionText(): string {
    return this.deal.registrationData.proposal.description;
  }

  bind() {
    this.watchResize();
    this.setIsMobile();
  }

  watchResize() {
    this.resizeWatcher = () => this.setIsMobile();
    window.addEventListener("resize", this.resizeWatcher);
  }

  setIsMobile() {
    this.isMobile = MobileService.isMobile();
  }

  detached() {
    window.removeEventListener("resize", this.resizeWatcher);
  }

  private readMore(): void {
    this.readingMore = true;
  }
}
