import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IBaseWizardStage } from "../../dealWizard.types";
import { WizardService, IWizard } from "../../../services/WizardService";

@autoinject
export class MakeOfferProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizard: IWizard;
  public errors: Record<string, string> = {};
  public disabled = false;

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

    if (!this.wizard.wizardResult.proposalLead.address) {
      this.errors.address = "Required Input";
    }

    const valid = !Object.keys(this.errors).length;

    this.wizardService.getCurrentStage(this.wizardManager).valid = valid;

    return valid;
  }
}
