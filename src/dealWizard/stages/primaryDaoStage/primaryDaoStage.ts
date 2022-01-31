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
    console.log('TCL: ProposalStage -> constructor -> _params', _params)
    console.log('TCL: ProposalStage -> constructor -> routeConfig', routeConfig)
    // @ts-ignore
    this.wizardManager = _params.wizardManager
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  }
}
