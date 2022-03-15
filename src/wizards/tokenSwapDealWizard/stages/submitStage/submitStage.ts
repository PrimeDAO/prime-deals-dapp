import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { AlertService, IAlertModel } from "services/AlertService";
import { FirestoreService } from "services/FirestoreService";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { IStageMeta } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { WizardManager } from "wizards/tokenSwapDealWizard/wizardManager";
import "./submitStage.scss";

@autoinject()
export class SubmitStage {
  public wizardManager: WizardManager;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private submitData: IDealRegistrationTokenSwap;

  constructor(
    private wizardService: WizardService,
    private alertService: AlertService,
    private eventAggregator: EventAggregator,
    private firestoreService: FirestoreService,
  ) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.submitData = this.wizardState.registrationData;
  }

  public async onSubmit(): Promise<void> {
    try {
      await this.firestoreService.createTokenSwapDeal(this.submitData);

      const congratulatePopupModel: IAlertModel = {
        header: "Your deal has been submitted!",
        message:
          "<p class='excitement'>Share your new deal proposal with your community!</p><p class='tweetlink'><a href='https://twitter.com' target='_blank' rel='noopener noreferrer'>TWEET <i class='fab fa-twitter'></i></a></p>",
        confetti: true,
        buttonTextPrimary: "Go to deal (todo)",
        className: "congratulatePopup",
      };

      await this.alertService.showAlert(congratulatePopupModel);
    } catch (error) {
      this.eventAggregator.publish("handleFailure", error);
    }
  }
}
