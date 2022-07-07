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

export class SubmitStage {
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private submitData: IDealRegistrationTokenSwap;
  private isOpenProposalLike = false;
  private isMakeAnOfferWizard = false;

  tokensTotal?: number;

  constructor(
    private alertService: AlertService,
    @IEventAggregator private eventAggregator: IEventAggregator,
    private dealService: DealService,
    @IRouter private router: IRouter,
    @IContainer private container: IContainer,
  ) {
  }

  async load(stageMeta: IStageMeta) {
    this.isOpenProposalLike = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);
    this.isMakeAnOfferWizard = stageMeta.wizardType === WizardType.makeAnOffer;
    this.submitData = this.wizardState.registrationData;
  }

}
