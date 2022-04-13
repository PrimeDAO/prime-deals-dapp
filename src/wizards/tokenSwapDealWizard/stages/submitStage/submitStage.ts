import { Router } from "aurelia-router";
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
  private isMakeAnOfferWizard = false;

  constructor(
    private wizardService: WizardService,
    private alertService: AlertService,
    private eventAggregator: EventAggregator,
    private dealService: DealService,
    private router: Router,
  ) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.isOpenProposalLike = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);
    this.isMakeAnOfferWizard = stageMeta.wizardType === WizardType.makeAnOffer;
    this.submitData = this.wizardState.registrationData;
  }

  public async onSubmit(): Promise<void> {
    try {
      this.eventAggregator.publish("deal.saving", true);
      try {
        if (!this.wizardManager.dealId || this.isMakeAnOfferWizard) {
        // const newDeal = use this for the button link below
          const newDeal = await this.dealService.createDeal(this.submitData);

          const dealIsAvailable = !!this.dealService.deals.get(newDeal.id);

          const congratulatePopupModel: IAlertModel = {
            header: "Submitted!",
            message:
              `<p class='excitement'>Share your new deal proposal with your community!</p><p class='copyLink'>
                <copy-to-clipboard-button text-to-copy='https://deals.prime.xyz/deal/${newDeal.id}'>Copy Deal Link to the Clipboard</copy-to-clipboard-button></p>`,
            confetti: true,
            buttonTextPrimary: dealIsAvailable ? "Go to deal" : "close",
            className: "congratulatePopup",
          };

          await this.alertService.showAlert(congratulatePopupModel);

          this.router.navigate(dealIsAvailable ? `deal/${newDeal.id}` : this.wizardState.previousRoute);

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
