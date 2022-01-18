import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { OpenDealWizardResult } from "./openDealWizardResult";
import { WizardService, IWizard, IWizardStage } from "../../services/WizardService";

@autoinject
export class OpenDealWizard {
  public wizard: IWizard;
  private stages: IWizardStage[] = [{
    name: "Proposal",
    valid: false,
    route: "stage1",
    moduleId: PLATFORM.moduleName("../stages/proposalStage/proposalStage"),
  }, {
    name: "Primary DAO",
    valid: false,
    route: "stage2",
    moduleId: PLATFORM.moduleName("../stages/primaryDao/primaryDao"),
  }];
  private wizardResult = new OpenDealWizardResult();

  constructor(public wizardService: WizardService) {
    this.wizard = this.wizardService.registerWizard(this, this.stages, this.wizardResult);
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private configureRouter(config: RouterConfiguration, router: Router): void {
    this.wizardService.configureRouter(this, config, router);
  }
}
