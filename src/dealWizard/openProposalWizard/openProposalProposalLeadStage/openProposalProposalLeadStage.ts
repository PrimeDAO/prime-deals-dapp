import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { WizardService, IWizardState } from "../../../services/WizardService";
import { IDealRegistrationData } from "entities/DealRegistrationData";

@autoinject
export class OpenProposalProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationData>;
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

    if (!this.wizardState.registrationData.proposalLead.address) {
      this.errors.address = "Required Input";
    }

    const valid = !Object.keys(this.errors).length;

    this.wizardService.updateStageValidity(this.wizardManager, valid);

    return valid;
  }
}
