import { IStageMeta } from "./../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { IWizardState, WizardErrors, WizardService } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap, IProposalLead } from "entities/DealRegistrationTokenSwap";
import { validateTrigger, ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { PrimeRenderer } from "../../../resources/elements/primeDesignSystem/validation/renderer";
import { getErrorsFromValidateResults, proposalLeadValidationRules } from "../../validation";

@autoinject
export class OpenProposalProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  public errors: WizardErrors<IProposalLead> = {};
  public form: ValidationController;

  constructor(public wizardService: WizardService, validationFactory: ValidationControllerFactory) {
    this.form = validationFactory.createForCurrentScope();
    this.form.addRenderer(new PrimeRenderer);
    this.form.validateTrigger = validateTrigger.changeOrFocusout;
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.form.addObject(this.wizardState.registrationData.proposalLead, proposalLeadValidationRules.rules);

    this.form.subscribe(event => {
      this.errors = getErrorsFromValidateResults(event.results);
    });

    this.wizardService.registerStageValidateFunction(this.wizardManager, () => {
      return this.form.validate().then(result => result.valid);
    });
  }
}
