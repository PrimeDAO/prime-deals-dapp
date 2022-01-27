import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { WizardService, IWizardState } from "../../../services/WizardService";
import { IDealRegistrationData } from "entities/DealRegistrationData";

@autoinject
export class MakeOfferProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationData>;
  public errors: Record<string, string> = {};
  public disabled = false;

  constructor(public wizardService: WizardService) {}

  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.wizardManager = routeConfig.settings.wizardManager;
    this.disabled = routeConfig.settings.disabled;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  }
}
