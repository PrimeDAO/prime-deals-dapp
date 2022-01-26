import { autoinject, useView } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { WizardService, IWizardState, IWizardStage } from "../../services/WizardService";
import { RegistrationData } from "../registrationData";

@useView(PLATFORM.moduleName("../wizardManager.html"))
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
  private registrationData = new RegistrationData();

  constructor(public wizardService: WizardService) {
    this.wizardState = this.wizardService.registerWizard(this, this.stages, this.registrationData);
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private configureRouter(config: RouterConfiguration, router: Router): void {
    this.wizardService.configureRouter(this, config, router);
  }
}
