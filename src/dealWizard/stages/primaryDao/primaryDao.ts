import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { DealWizardService, IWizardConfig } from "services/DealWizardService";
import { IBaseWizardStage } from "../../dealWizard.types";
import "../wizardStage.scss";

@autoinject
export class PrimaryDAO implements IBaseWizardStage {
  public wizardManager: any;
  public wizard: IWizardConfig;
  public errors: {[key: string]: string} = {};

  constructor(private dealWizardService: DealWizardService) {}

  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.wizardManager = routeConfig.settings.wizardManager;
  }

  attached(): void {
    this.wizard = this.dealWizardService.getWizard(this.wizardManager);
  }

  validateInputs(): boolean {
    this.errors = {};

    if (!this.wizard.wizardResult.daos[0].name) {
      this.errors.name ="Please enter the name of the Primary DAO";
    }

    this.wizard.stages.find(stage => stage.name === "Primary DAO").valid = !Object.keys(this.errors).length;

    return !Object.keys(this.errors).length;
  }

  proceed(): void {
    if (this.validateInputs()){
      this.dealWizardService.proceed(this.wizardManager);
    }
  }

  cancel(): void {
    this.dealWizardService.cancel();
  }

  previous(): void {
    this.dealWizardService.previous(this.wizardManager);
  }
}
