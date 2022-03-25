import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { AlertService, IAlertModel } from "services/AlertService";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { IStageMeta, WizardType } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { WizardManager } from "wizards/tokenSwapDealWizard/wizardManager";
import "./submitStage.scss";
import { DealService } from "services/DealService";

@autoinject()
export class SubmitStage {
  public wizardManager: WizardManager;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private submitData: IDealRegistrationTokenSwap;
  private isOpenProposalLike = false;

  constructor(
    private wizardService: WizardService,
    private alertService: AlertService,
    private eventAggregator: EventAggregator,
    private dealService: DealService,
  ) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.isOpenProposalLike = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);
    this.submitData = this.wizardState.registrationData;
  }

  public async onSubmit(): Promise<void> {
    try {
      this.eventAggregator.publish("deal.saving", true);
      try {
        if (!this.wizardManager.dealId) {
        // const newDeal = use this for the button link below
          await this.dealService.createDeal(this.submitData);

          const congratulatePopupModel: IAlertModel = {
            header: "Your deal has been submitted!",
            message:
          "<p class='excitement'>Share your new deal proposal with your community!</p><p class='tweetlink'><a href='https://twitter.com' target='_blank' rel='noopener noreferrer'>TWEET <i class='fab fa-twitter'></i></a></p>",
            confetti: true,
            buttonTextPrimary: "Go to deal (todo)",
            className: "congratulatePopup",
          };

          await this.alertService.showAlert(congratulatePopupModel);

        } else {
          await this.dealService.updateRegistration(this.wizardManager.dealId, this.submitData);
          this.eventAggregator.publish("handleInfo", "Your deal registration was successfully saved");
        }
      } catch (error) {
        this.eventAggregator.publish("handleFailure", `There was an error while creating the Deal: ${error}`);
      }
    } finally {
      this.eventAggregator.publish("deal.saving", false);
    }
  }
}
