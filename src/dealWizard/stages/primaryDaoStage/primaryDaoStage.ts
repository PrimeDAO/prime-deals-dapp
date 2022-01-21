import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { WizardService, IWizard } from "services/WizardService";
import { IBaseWizardStage } from "../../dealWizard.types";

@autoinject
export class PrimaryDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizard: IWizard;
  public errors: Record<string, string> = {};
  public disabled: boolean;

  constructor(public wizardService: WizardService) {}

  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.wizardManager = routeConfig.settings.wizardManager;
    this.disabled = routeConfig.settings.disabled;
  }

  attached(): void {
    this.wizard = this.wizardService.getWizard(this.wizardManager);
  }

  validateInputs(): boolean {
    this.errors = {};

    if (!this.wizard.wizardResult.primaryDAO.name) {
      this.errors.name = "Please enter the name of the Primary DAO";
    }

    const valid = !Object.keys(this.errors).length;

    this.wizardService.getCurrentStage(this.wizardManager).valid = valid;

    return valid;
  }
}
