import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { WizardService, IWizard } from "services/WizardService";
import { IBaseWizardStage } from "../../dealWizard.types";
import "../wizardStage.scss";

@autoinject
export class PrimaryDAO implements IBaseWizardStage {
  public wizardManager: any;
  public wizard: IWizard;
  public errors: Record<string, string> = {};

  constructor(public wizardService: WizardService) {}

  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.wizardManager = routeConfig.settings.wizardManager;
  }

  attached(): void {
    this.wizard = this.wizardService.getWizard(this.wizardManager);
  }

  validateInputs(): boolean {
    this.errors = {};

    if (!this.wizard.wizardResult.daos[0].name) {
      this.errors.name = "Please enter the name of the Primary DAO";
    }

    this.wizardService.getCurrentStage(this.wizardManager).valid = !Object.keys(this.errors).length;

    return !Object.keys(this.errors).length;
  }

  proceed(): void {
    if (this.validateInputs()){
      this.wizardService.proceed(this.wizardManager);
    }
  }
}
