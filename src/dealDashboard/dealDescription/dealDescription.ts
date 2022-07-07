import { bindable } from "aurelia";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { MobileService } from "services/MobileService";

const MOBILE_MAX_LENGTH = 250;

export class DealDescription {
  @bindable deal: DealTokenSwap;

  private resizeWatcher;
  private isMobile: boolean;
  private readingMore = false;

  /**
   * Description text is shortened to 250 words
   */
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

  get showReadMoreButton() {
    return this.isMobile && !this.readingMore;
  }

  get originalDescriptionText(): string {
    return this.deal?.registrationData.proposal.description;
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

  detaching() {
    window.removeEventListener("resize", this.resizeWatcher);
  }

  private readMore(): void {
    this.readingMore = true;
  }
}
