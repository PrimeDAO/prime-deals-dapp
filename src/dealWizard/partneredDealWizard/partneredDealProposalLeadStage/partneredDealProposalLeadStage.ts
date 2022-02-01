import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { proposalLeadValidationRules, validateWizardState } from "../../validation";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { IDealRegistrationData } from "../../../entities/DealRegistrationData";

@autoinject
export class PartneredDealProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationData>;
  public errors: Record<string, string> = {};
  private form: ValidationController;

  constructor(public wizardService: WizardService, validationFactory: ValidationControllerFactory) {
    this.form = validationFactory.createForCurrentScope();
  }

  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.wizardManager = routeConfig.settings.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.wizardService.registerStageValidateFunction(this.wizardManager, this.validate.bind(this));
  }

  async validate(): Promise<boolean> {
    const [formResult, errors] = await validateWizardState(this.form, this.wizardState.registrationData.proposalLead, proposalLeadValidationRules);
    this.errors = errors;

    this.wizardService.updateStageValidity(this.wizardManager, formResult.valid);

    return formResult.valid;
  }
}
