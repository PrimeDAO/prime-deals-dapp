import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { OpenProposalWizardResult } from "./openProposalWizardResult";
import { WizardService, IWizardState, IWizardStage } from "../../services/WizardService";

@autoinject
export class OpenProposalWizardManager {
  public wizardState: IWizardState;
  private stages: IWizardStage[] = [{
    name: "Proposal",
    valid: false,
    route: "stage1",
    moduleId: PLATFORM.moduleName("../stages/proposalStage/proposalStage"),
  }, {
    name: "Lead Details",
    valid: false,
    route: "stage2",
    moduleId: PLATFORM.moduleName("./openProposalProposalLeadStage/openProposalProposalLeadStage"),
  }, {
    name: "Primary DAO",
    valid: false,
    route: "stage3",
    moduleId: PLATFORM.moduleName("../stages/primaryDaoStage/primaryDaoStage"),
  }];
  private wizardResult = new OpenProposalWizardResult();

  constructor(public wizardService: WizardService) {
    this.wizardState = this.wizardService.registerWizard(this, this.stages, this.wizardResult);
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private configureRouter(config: RouterConfiguration, router: Router): void {
    this.wizardService.configureRouter(this, config, router);
  }
}
