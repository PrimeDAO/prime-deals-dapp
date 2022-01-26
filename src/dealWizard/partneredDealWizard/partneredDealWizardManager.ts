import { autoinject, useView } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { WizardService, IWizardState, IWizardStage } from "../../services/WizardService";
import { DealRegistrationData, IDealRegistrationData } from "entities/DealRegistrationData";

@useView(PLATFORM.moduleName("../wizardManager.html"))
@autoinject
export class PartneredDealWizardManager {
  public wizardState: IWizardState<IDealRegistrationData>;
  private stages: IWizardStage[] = [{
    name: "Proposal",
    valid: false,
    route: "stage1",
    moduleId: PLATFORM.moduleName("../stages/proposalStage/proposalStage"),
    validationMethod: this.wizardValidationService.validateProposalStage,
  }];
  private registrationData = new DealRegistrationData();

  constructor(public wizardService: WizardService, private wizardValidationService: WizardValidationService) {
    this.wizardState = this.wizardService.registerWizard(this, this.stages, this.registrationData);
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private configureRouter(config: RouterConfiguration, router: Router): void {
    this.wizardService.configureRouter(this, config, router);
  }
}
