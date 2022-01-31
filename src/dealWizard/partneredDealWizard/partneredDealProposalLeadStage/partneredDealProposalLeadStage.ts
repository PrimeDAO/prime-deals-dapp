import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IBaseWizardStage } from "../../dealWizard.types";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { IDealRegistrationData } from "../../../entities/Deal";
import { proposalLeadValidationRules, validateWizardState } from "../../validation";

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
  }

  async validateInputs(): Promise<boolean> {
    const [formResult, errors] = await validateWizardState(this.form, this.wizardState.registrationData.proposalLead, proposalLeadValidationRules);
    this.errors = errors;

    this.wizardService.updateStageValidity(this.wizardManager, formResult.valid);

    return formResult.valid;
  }
}
