import { autoinject } from "aurelia-framework";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { validateTrigger, ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { getErrorsFromValidateResults, proposalLeadValidationRules, validateWizardState } from "../../validation";
import { IBaseWizardStage, IStageMeta } from "../../dealWizardTypes";
import { IDealRegistrationData } from "../../../entities/DealRegistrationData";

@autoinject
export class PartneredDealProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationData>;
  public errors: Record<string, string> = {};
  private form: ValidationController;

  constructor(public wizardService: WizardService, validationFactory: ValidationControllerFactory) {
    this.form = validationFactory.createForCurrentScope();
    this.form.validateTrigger = validateTrigger.changeOrBlur
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.form.addObject(this.wizardState.registrationData.proposalLead, proposalLeadValidationRules)
    this.form.subscribe(event => {
      console.log('validation event triggered ->', event)
      this.errors = getErrorsFromValidateResults(event.results)
    })
    this.wizardService.registerStageValidateFunction(this.wizardManager, this.validateOnSubmit.bind(this));
  }

  async validateOnSubmit(): Promise<boolean> {
    const [formResult, errors] = await validateWizardState(this.form, this.wizardState.registrationData.proposalLead, proposalLeadValidationRules);
    this.errors = errors;

    this.wizardService.updateStageValidity(this.wizardManager, formResult.valid);

    return formResult.valid;
  }
}
