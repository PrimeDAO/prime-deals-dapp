import { DealTokenSwap } from "entities/DealTokenSwap";
// import { availableSocialMedias } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { DisposableCollection } from "../../services/DisposableCollection";
import { bindable, IEventAggregator } from "aurelia";
import { availableSocialMedias } from "../../wizards/tokenSwapDealWizard/dealWizardTypes";

export class DealInfo {
  @bindable deal: DealTokenSwap;

  private subscriptions = new DisposableCollection();
  private settingPrivacy = false;

  showMoreRepresentatives = false;
  showMoreRewards: false;

  panelRepresentatives: HTMLElement;
  panelRewards: HTMLElement;

  get maxHeightRepresentatives() {
    return this.showMoreRepresentatives ? this.panelRepresentatives.scrollHeight + "px" : "";
  }

  get maxHeightRewards() {
    return this.showMoreRewards ? this.panelRewards.scrollHeight + "px" : "";
  }

  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
  ) {
  }

  getSocialMediaDetails(socialMediaName: string) {
    return availableSocialMedias.find(socialMedia => socialMedia.name === socialMediaName);
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
