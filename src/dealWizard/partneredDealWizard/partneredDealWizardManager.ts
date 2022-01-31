import { autoinject, useView } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { RegistrationData } from "../registrationData";
import { IWizardStage, IWizardState, WizardService } from "../../services/WizardService";
import { IDealRegistrationData } from "entities/Deal";

@useView(PLATFORM.moduleName("../wizardManager.html"))
@autoinject
export class PartneredDealWizardManager {
  public wizardState: IWizardState<IDealRegistrationData>;
  private stages: IWizardStage[] = [
    {
      name: "Proposal",
      valid: false,
      route: "stage1",
      moduleId: PLATFORM.moduleName("../stages/proposalStage/proposalStage"),
    },
    {
      name: "Lead details",
      valid: false,
      route: "stage2",
      moduleId: PLATFORM.moduleName("./partneredDealProposalLeadStage/partneredDealProposalLeadStage"),
    },
  ];
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
