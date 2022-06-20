import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { AlertService, IAlertModel } from "services/AlertService";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { IStageMeta, WizardType } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { WizardManager } from "wizards/tokenSwapDealWizard/wizardManager";
import { DealService } from "services/DealService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { Utils } from "services/utils";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";
import { IContainer, IEventAggregator } from "aurelia";
import { IRouter } from "@aurelia/router";

@processContent(autoSlot)
export class SubmitStage {
  public wizardManager: WizardManager;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private submitData: IDealRegistrationTokenSwap;
  private isOpenProposalLike = false;
  private isMakeAnOfferWizard = false;

  constructor(
    private wizardService: WizardService,
    private alertService: AlertService,
    @IEventAggregator private eventAggregator: IEventAggregator,
    private dealService: DealService,
    @IRouter private router: IRouter,
    @IContainer private container: IContainer,
  ) {
  }

  load(stageMeta: IStageMeta): void {
    this.wizardManager = this.container.get<WizardManager>("WizardManager");
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.isOpenProposalLike = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);
    this.isMakeAnOfferWizard = stageMeta.wizardType === WizardType.makeAnOffer;
    this.submitData = this.wizardState.registrationData;
  }

  public async onSubmit(): Promise<void> {
    try {
      this.eventAggregator.publish("deal.saving", true);

      const creating = !this.wizardManager.dealId || this.isMakeAnOfferWizard;
      let newDeal: DealTokenSwap;

      try {
        if (creating) {
          // const newDeal = use this for the button link below
          newDeal = await this.dealService.createDeal(this.submitData);
        } else {
          await this.dealService.updateRegistration(this.wizardManager.dealId, this.submitData);
          // this.eventAggregator.publish("handleInfo", "Your deal registration was successfully saved");
          newDeal = this.dealService.deals.get(this.wizardManager.dealId);
          /**
           * It is possible that the user has just made themselves no longer authorized to see the deal.
           * Wait for a hopefully reasonable amount of time for the deal to be deleted in that case.
           * Worst case is they will be booted out of the dashboard.
           *
           * If in that case they tried to go anywhere else in the wizard they should
           * be booted out of the wizard.
           */
          await Utils.sleep(1000);
        }

        const dealIsAvailable = !!this.dealService.deals.get(newDeal.id);

        const urlBase = `${window.location.protocol}//${window.location.host}/deal/${newDeal.id}`;

        const congratulatePopupModel: IAlertModel = {
          header: "Submitted!",
          message:
            `<p class='excitement'>Share your new deal proposal with your community!</p><p class='copyLink'>
                <copy-to-clipboard-button text-to-copy='${urlBase}'>Copy Deal Link to the Clipboard</copy-to-clipboard-button></p>`,
          confetti: true,
          buttonTextPrimary: dealIsAvailable ? "Go to deal" : "close",
          className: "congratulatePopup",
        };

        await this.alertService.showAlert(congratulatePopupModel);

        this.router.load(dealIsAvailable ? `/deal/${newDeal.id}` : this.wizardState.previousRoute);

      } catch (error) {
        this.eventAggregator.publish("handleFailure", `There was an error while creating the Deal: ${error}`);
      }
    } finally {
      this.eventAggregator.publish("deal.saving", false);
    }
  }
}
