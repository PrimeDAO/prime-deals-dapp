import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import { WizardService, IWizardState, IWizardStage } from "services/WizardService";
import { DealRegistrationData, IDealRegistrationData } from "entities/DealRegistrationData";
import { WizardType } from "./dealWizardTypes";

@autoinject
export class WizardManager {
  public wizardState: IWizardState<IDealRegistrationData>;
  private stages: IWizardStage[] = [{
    name: "Proposal",
    valid: false,
    route: "stage1",
    moduleId: PLATFORM.moduleName("./stages/proposalStage/proposalStage"),
    settings: {},
  }, {
    name: "Lead Details",
    valid: false,
    route: "stage2",
    moduleId: PLATFORM.moduleName("./openProposalWizard/openProposalProposalLeadStage/openProposalProposalLeadStage"),
    settings: {},
  }, {
    name: "Primary DAO",
    valid: false,
    route: "stage3",
    moduleId: PLATFORM.moduleName("./stages/primaryDaoStage/primaryDaoStage"),
    settings: {},
  }];
  private registrationData = new DealRegistrationData();

  constructor(public wizardService: WizardService) {
    this.configureStages();
    this.wizardState = this.wizardService.registerWizard(this, this.stages, this.registrationData);
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private configureStages() {
    const wizardType = this.getWizardType();
    switch (wizardType) {
      case WizardType.partneredDeal:
      case WizardType.makeAnOffer:
        // @TODO this configuration could be done in a cleaner way, this is proof of concept
        this.stages.push({
          name: "Partner DAO",
          valid: false,
          route: "stage4",
          moduleId: PLATFORM.moduleName("./stages/partnerDaoStage/partnerDaoStage"),
          settings: {},
        });
        break;

      default:
        break;
    }

    this.addWizardTypeToStages(wizardType);
  }

  private getWizardType(): WizardType {
    // @TODO add logic

    return WizardType.partneredDeal;
  }

  private addWizardTypeToStages(wizardType: WizardType) {
    this.stages.forEach(stage => {
      stage.settings.wizardType = wizardType;
    });
  }

  private configureRouter(config: RouterConfiguration, router: Router): void {
    this.wizardService.configureRouter(this, config, router);
  }
}
