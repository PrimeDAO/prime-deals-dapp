import { IStageMeta } from "./../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap, IProposal } from "entities/DealRegistrationTokenSwap";
import { ValidationRules } from "aurelia-validation";

@autoinject
export class ProposalStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  constructor(public wizardService: WizardService) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    const validationRules = ValidationRules
      .ensure<IProposal, string>(proposal => proposal.title)
      .required()
      .ensure<string>(proposal => proposal.summary)
      .required()
      .minLength(10)
      .ensure<string>(proposal => proposal.description)
      .required()
      .minLength(10)
      .rules;

    this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData.proposal,
      validationRules,
    );
  }
}
