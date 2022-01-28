import { autoinject, useView } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { DealRegistrationData, IDealRegistrationData } from "entities/DealRegistrationData";
import { WizardService, IWizardState, IWizardStage } from "../../services/WizardService";

@useView(PLATFORM.moduleName("../wizardManager.html"))
@autoinject
export class OpenProposalWizardManager {
  public wizardState: IWizardState<IDealRegistrationData>;
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
  private registrationData = new DealRegistrationData();

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
