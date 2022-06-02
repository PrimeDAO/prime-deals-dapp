import { DealTokenSwap } from "entities/DealTokenSwap";
// import { availableSocialMedias } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { DisposableCollection } from "../../services/DisposableCollection";
import { bindable, IEventAggregator } from "aurelia";

export class DealInfo {
  @bindable deal: DealTokenSwap;

  private subscriptions = new DisposableCollection();
  private settingPrivacy = false;

  showMore = false;

  panel: HTMLElement;

  get maxHeight() {
    return this.showMore ? this.panel.scrollHeight + "px" : "";
  }

  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
  ) {
  }

  getSocialMediaDetails(socialMediaName: string) {
    console.log(socialMediaName);
    // return availableSocialMedias.find(socialMedia => socialMedia.name === socialMediaName);
  }

  async changePrivacy(checked: boolean) {
    if (this.settingPrivacy) {
      return;
    }

    this.settingPrivacy = true;

    await this.deal.setPrivacy(checked).catch(() => {
      this.eventAggregator.publish("handleFailure", "Sorry, an error occurred");
    }).finally(() => this.settingPrivacy = false);

    this.eventAggregator.publish("showMessage", "Deal privacy has been successfully submitted");
  }

  public detached() {
    this.subscriptions.dispose();
  }

}
