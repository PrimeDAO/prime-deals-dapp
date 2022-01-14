import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IBaseWizardStage } from "../../dealWizard.types";
import { WizardService, IWizard } from "../../../services/WizardService";
import "../wizardStage.scss";

@autoinject
export class ProposalStage implements IBaseWizardStage {
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

    if (!this.wizard.wizardResult.proposal.name) {
      this.errors.name ="Please enter a name for your proposal";
    }

    if (this.wizard.wizardResult.proposal.overview.length < 5) {
      this.errors.overview = "Please enter a descriptive overview for your proposal";
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
