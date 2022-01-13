import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { IWizardStage } from "dealWizard/dealWizard.types";
import { OpenDealWizardResult } from "./openDealWizardResult";
import { DealWizardService } from "../../services/DealWizardService";

@autoinject
export class OpenDealWizard {
  public wizardManager = this;
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

  constructor(private dealWizardService: DealWizardService) {
    this.dealWizardService.registerWizard(this, this.stages, this.wizardResult);
  }

  private attached(): void {
    this.dealWizardService.updateIndexOfActiveBaseOnRoute(this);
  }

  private configureRouter(config: RouterConfiguration, router: Router): void {
    this.dealWizardService.configureRouter(this, config, router);
  }
}
