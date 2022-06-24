import { IBaseWizardStage } from "../../dealWizardTypes";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap, IProposal } from "entities/DealRegistrationTokenSwap";
import { inject } from "aurelia";
import { IValidationRules } from "@aurelia/validation";
import { IValidationController } from "@aurelia/validation-html";
import { newInstanceForScope } from "@aurelia/kernel";

@inject()
export class ProposalStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  proposal: IProposal;

  constructor(
    public wizardService: WizardService,
    @newInstanceForScope(IValidationController) public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
  ) {
  }

  load(): void {
    this.wizardManager = this.wizardService.currentWizard;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.proposal = this.wizardState.registrationData.proposal;

    this.validationRules
      .on(this.proposal)
      .ensure("title")
      .required()
      .ensure("summary")
      .required()
      .minLength(10)
      .ensure("description")
      .required()
      .minLength(10);

    this.wizardService.registerForm(
      this.wizardManager,
      this.form,
    );
  }
}
