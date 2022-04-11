import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { availableSocialMedias } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import "./dealInfo.scss";
import { DisposableCollection } from "../../services/DisposableCollection";
import { EventAggregator } from "aurelia-event-aggregator";
import { AureliaHelperService } from "../../services/AureliaHelperService";

@autoinject
export class DealInfo {
  @bindable deal: DealTokenSwap;

  private subscriptions = new DisposableCollection();
  private settingPrivacy = false;

  constructor(
    private eventAggregator: EventAggregator,
    private aureliaHelperService: AureliaHelperService,
  ) {
  }

  getSocialMediaDetails(socialMediaName: string) {
    return availableSocialMedias.find(socialMedia => socialMedia.name === socialMediaName);
  }

  public async attached() {
    this.subscriptions.push(
      this.aureliaHelperService.createPropertyWatch(this.deal, "isPrivate", async (value: boolean) => {
        if (this.settingPrivacy) {
          return;
        }

        this.settingPrivacy = true;

        await this.deal.setPrivacy(value).catch(() => {
          this.eventAggregator.publish("handleFailure", "Sorry, an error occurred");
        }).finally(() => this.settingPrivacy = false);

        this.eventAggregator.publish("showMessage", "Deal privacy has been successfully submitted");
      }),
    );
  }

  public detached() {
    this.subscriptions.dispose();
  }

}
