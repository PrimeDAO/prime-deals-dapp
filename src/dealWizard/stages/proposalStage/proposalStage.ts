import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IBaseWizardStage } from "../../dealWizard.types";
import { WizardService, IWizardState } from "../../../services/WizardService";

@autoinject
export class ProposalStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState;
  public errors: Record<string, string> = {};

  constructor(public wizardService: WizardService) {}

  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.wizardManager = routeConfig.settings.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  }

  validateInputs(): boolean {
    this.errors = {};

    if (!this.wizardState.wizardResult.proposal.title) {
      this.errors.title = "Required Input";
    }

    if (!this.wizardState.wizardResult.proposal.summary) {
      this.errors.summary = "Required Input";
    } else if (this.wizardState.wizardResult.proposal.summary.length < 10) {
      this.errors.summary = "Input is too short";
    }

    if (!this.wizardState.wizardResult.proposal.description) {
      this.errors.description = "Required Input";
    } else if (this.wizardState.wizardResult.proposal.description.length < 10) {
      this.errors.description = "Input is too short";
    }

    const valid = !Object.keys(this.errors).length;

    this.wizardService.getCurrentStage(this.wizardManager).valid = valid;

    return valid;
  }
}
