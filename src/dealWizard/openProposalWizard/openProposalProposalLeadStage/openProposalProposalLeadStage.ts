import { IStageMeta } from "./../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { IWizardState, WizardErrors, WizardService } from "../../../services/WizardService";
import { IDealRegistrationData, IProposalLead } from "entities/DealRegistrationData";
import { ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { getErrorsFromValidateResults, proposalLeadValidationRules } from "../../validation";

@autoinject
export class OpenProposalProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationData>;
  public errors: WizardErrors<IProposalLead> = {};

  private form: ValidationController;

  constructor(public wizardService: WizardService, validationFactory: ValidationControllerFactory) {
    this.form = validationFactory.createForCurrentScope();
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.form.addObject(this.wizardState.registrationData.proposalLead, proposalLeadValidationRules);
    this.form.subscribe(event => {
      this.errors = getErrorsFromValidateResults(event.results);
    });
    // This is a small hack used to "activate" the validation on custom inputs
    this.form.validate().then(() => {
      this.form.reset();
    });
    this.wizardService.registerStageValidateFunction(this.wizardManager, this.validate.bind(this));
  }

  async validate(): Promise<boolean> {
    // const [formResult, errors] = await validateWizardState(this.form, this.wizardState.registrationData.proposalLead, proposalLeadValidationRules);
    // this.errors = errors;
    //
    // this.wizardService.updateStageValidity(this.wizardManager, formResult.valid);
    //
    // return formResult.valid;
    return false;
  }
}
