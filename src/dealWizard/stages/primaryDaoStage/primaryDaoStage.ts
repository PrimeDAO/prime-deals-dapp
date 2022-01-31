import { autoinject } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import { IDealRegistrationData } from "entities/DealRegistrationData";
import { WizardService, IWizardState } from "services/WizardService";
import { IBaseWizardStage, WizardType } from "../../dealWizardTypes";

@autoinject
export class PrimaryDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationData>;
  public errors: Record<string, string> = {};
  public disabled: boolean;

  constructor(public wizardService: WizardService) {}

  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.wizardManager = routeConfig.settings.wizardManager;
    const wizardType = routeConfig.settings.wizardType;
    this.disabled = wizardType === WizardType.makeAnOffer;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  }
}
