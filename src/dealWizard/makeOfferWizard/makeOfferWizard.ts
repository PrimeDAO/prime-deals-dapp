import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { MakeOfferWizardResult } from "./makeOfferWizardResult";
import { WizardService, IWizard, IWizardStage } from "../../services/WizardService";

@autoinject
export class MakeOfferWizard {
  public wizard: IWizard;
  private stages: IWizardStage[] = [{
    name: "Proposal",
    valid: false,
    route: "stage1",
    moduleId: PLATFORM.moduleName("../stages/proposalStage/proposalStage"),
  }, {
    name: "Lead Details",
    valid: false,
    route: "stage2",
    moduleId: PLATFORM.moduleName("../stages/proposalLeadStage/proposalLeadStage"),
  }, {
    name: "Primary DAO",
    valid: false,
    route: "stage3",
    moduleId: PLATFORM.moduleName("../stages/primaryDaoStage/primaryDaoStage"),
    settings: {
      disabled: true,
    },
  }, {
    name: "Partner DAO",
    valid: false,
    route: "stage4",
    moduleId: PLATFORM.moduleName("../stages/partnerDaoStage/partnerDaoStage"),
  }];
  private wizardResult = new MakeOfferWizardResult();

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
