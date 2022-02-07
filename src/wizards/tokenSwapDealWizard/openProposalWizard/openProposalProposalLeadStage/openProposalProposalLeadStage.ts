import { IStageMeta } from "../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { WizardService, IWizardState, WizardErrors } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap, IProposalLead } from "entities/DealRegistrationTokenSwap";

@autoinject
export class OpenProposalProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  public errors: WizardErrors<IProposalLead> = {};

  constructor(public wizardService: WizardService) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.wizardService.registerStageValidateFunction(this.wizardManager, this.validate.bind(this));
  }

  validate(): boolean {
    this.errors = {};

    if (!this.wizardState.registrationData.proposalLead.address) {
      this.errors.address = "Required Input";
    }

    return !Object.keys(this.errors).length;
  }
}
