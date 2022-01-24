import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { WizardService, IWizardState } from "services/WizardService";
import { IBaseWizardStage } from "../../dealWizard.types";

@autoinject
export class PartnerDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState;
  public errors: Record<string, string> = {};
  public disabled: boolean;

  constructor(public wizardService: WizardService) {}

  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.wizardManager = routeConfig.settings.wizardManager;
    this.disabled = routeConfig.settings.disabled;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  }

  validateInputs(): boolean {
    this.errors = {};

    if (!this.wizardState.wizardResult.partnerDAO.name) {
      this.errors.name = "Please enter the name of the Partner DAO";
    }

    const valid = !Object.keys(this.errors).length;

    this.wizardService.updateStageValidity(this.wizardManager, valid);

    return valid;
  }
}
