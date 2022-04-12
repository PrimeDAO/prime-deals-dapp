import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { availableSocialMedias } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import "./dealInfo.scss";
import { DisposableCollection } from "../../services/DisposableCollection";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class DealInfo {
  @bindable deal: DealTokenSwap;

  private subscriptions = new DisposableCollection();
  private settingPrivacy = false;

  constructor(
    private eventAggregator: EventAggregator,
  ) {
  }

  getSocialMediaDetails(socialMediaName: string) {
    return availableSocialMedias.find(socialMedia => socialMedia.name === socialMediaName);
  }

  async changePrivacy() {
    if (this.settingPrivacy) {
      return;
    }

    this.settingPrivacy = true;

    await this.deal.setPrivacy(this.deal.isPrivate).catch(() => {
      this.eventAggregator.publish("handleFailure", "Sorry, an error occurred");
    }).finally(() => this.settingPrivacy = false);

    this.eventAggregator.publish("showMessage", "Deal privacy has been successfully submitted");
  }

  public detached() {
    this.subscriptions.dispose();
  }

}
