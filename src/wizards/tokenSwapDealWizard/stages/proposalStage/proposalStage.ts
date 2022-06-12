import { IBaseWizardStage, IStageMeta } from "../../dealWizardTypes";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap, IProposal } from "entities/DealRegistrationTokenSwap";
import { inject } from "aurelia";
import { IValidationRules } from "@aurelia/validation";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationController } from "@aurelia/validation-html";

@inject()
export class ProposalStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  proposal: IProposal;

  constructor(
    public wizardService: WizardService,
    @IValidationRules private validationRules: IValidationRules,
    @newInstanceForScope(IValidationController) private form: IValidationController,
  ) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
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

    this.form = this.wizardService.registerForm(
      this.wizardManager,
      this.form,
    );
  }
}
