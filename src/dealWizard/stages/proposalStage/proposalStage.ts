import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IBaseWizardStage } from "../../dealWizard.types";
import { DealWizardService, IWizardConfig } from "../../../services/DealWizardService";
import "../wizardStage.scss";

@autoinject
export class ProposalStage implements IBaseWizardStage {
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

    if (!this.wizard.wizardResult.proposal.name) {
      this.errors.name ="Please enter a name for your proposal";
    }

    if (this.wizard.wizardResult.proposal.overview.length < 5) {
      this.errors.overview = "Please enter a descriptive overview for your proposal";
    }

    this.wizard.stages.find(stage => stage.name === "Proposal").valid = !Object.keys(this.errors).length;

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
