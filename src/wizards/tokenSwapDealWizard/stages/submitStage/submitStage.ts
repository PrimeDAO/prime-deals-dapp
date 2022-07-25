import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { AlertService } from "services/AlertService";
import { IWizardState } from "wizards/services/WizardService";
import { IStageMeta, WizardType } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { DealService } from "services/DealService";
import { Controller, IContainer, IEventAggregator, inject } from "aurelia";
import { IRouter } from "@aurelia/router";
import { WizardManager } from "../../wizardManager";

export class SubmitStage {
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private isOpenProposalLike = false;
  private isMakeAnOfferWizard = false;

  tokensTotal?: number;

  constructor(
    private alertService: AlertService,
    @IEventAggregator private eventAggregator: IEventAggregator,
    private dealService: DealService,
    @IRouter private router: IRouter,
    @IContainer private container: IContainer,
    @inject("registrationData") private readonly submitData: IDealRegistrationTokenSwap,
  ) {
  }

  async load(stageMeta: IStageMeta) {
    this.isOpenProposalLike = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);
    this.isMakeAnOfferWizard = stageMeta.wizardType === WizardType.makeAnOffer;
  }
  async bound(context: Controller, parentContext: Controller) {
    const wizardManager = parentContext.parent.viewModel as WizardManager;
    this.tokensTotal = await wizardManager.getTokensTotalPrice();
  }

}
