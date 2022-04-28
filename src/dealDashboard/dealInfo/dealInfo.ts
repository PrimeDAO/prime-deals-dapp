import { autoinject, bindable, computedFrom } from "aurelia-framework";
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

  showMore = false;

  panel: HTMLElement;

  @computedFrom("showMore")
  get maxHeight() {
    return this.showMore ? this.panel.scrollHeight + "px" : "";
  }

  constructor(
    private eventAggregator: EventAggregator,
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
