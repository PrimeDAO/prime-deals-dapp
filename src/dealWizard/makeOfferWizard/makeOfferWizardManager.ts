import { autoinject, useView } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { IDealRegistrationData } from "entities/Deal";
import { WizardService, IWizardState, IWizardStage } from "../../services/WizardService";
import { RegistrationData } from "../registrationData";

@useView(PLATFORM.moduleName("../wizardManager.html"))
@autoinject
export class MakeOfferWizardManager {
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
    moduleId: PLATFORM.moduleName("./makeOfferProposalLeadStage/makeOfferProposalLeadStage"),
    settings: {
      // @TODO this should be passed conditionally, that is if open proposal "keep admin rights" is set to true, we should pass true, otherwise false
      disabled: true,
      // @TODO to pass information about what wizard it is
      // instead of doing any logic here (such as disableThis: true, disableThat: false)
      // we could provide a flag "makingAnOffer: true"
      // and then the stage component could handle the logic
    },
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
