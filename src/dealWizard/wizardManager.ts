import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration, RouteConfig } from "aurelia-router";
import { WizardService, IWizardState, IWizardStage } from "services/WizardService";
import { DealRegistrationData, IDealRegistrationData } from "entities/DealRegistrationData";
import { WizardType } from "./dealWizardTypes";

@autoinject
export class WizardManager {
  public wizardState: IWizardState<IDealRegistrationData>;
  private stages: IWizardStage[] = [{
    name: "Proposal",
    valid: false,
    route: "initiate/token-swap/open-proposal/stage1",
    moduleId: "./stages/proposalStage/proposalStage",
    settings: {},
  }, {
    name: "Lead Details",
    valid: false,
    route: "initiate/token-swap/open-proposal/stage2",
    moduleId: "./openProposalWizard/openProposalProposalLeadStage/openProposalProposalLeadStage",
    // moduleId: "./openProposalWizard/openProposalProposalLeadStage/openProposalProposalLeadStage",
    settings: {},
  }, {
    name: "Primary DAO",
    valid: false,
    route: "initiate/token-swap/open-proposal/stage3",
    moduleId: "./stages/primaryDaoStage/primaryDaoStage",
    settings: {},
  }];
  private registrationData = new DealRegistrationData();

  private WizardManagerInstance = this;

  private infoForStages: any;
  view: string;
  viewModel: string;

  constructor(public wizardService: WizardService) {
    PLATFORM.moduleName("./openProposalWizard/openProposalProposalLeadStage/openProposalProposalLeadStage")
    // this.configureStages();
  }

  activate(params: any, routeConfig: RouteConfig, other): void {
    console.log('TCL: StagesWelcome -> params', params)
    // console.log('TCL: StagesWelcome -> routeConfig', routeConfig)
    console.log('TCL: WizardManager -> routeConfig.settings.wizardType', routeConfig.settings.wizardType)
    // console.log('TCL: StagesWelcome -> other', other)
    if (!params.stageNumber) return

    const { stageNumber } = params;
      // console.log('TCL: StagesWelcome -> stageNumber', stageNumber)


    this.wizardState = this.wizardService.registerWizard(this, this.stages, this.registrationData);
    console.log('>>>> TCL: WizardManager -> this.wizardState', this.wizardState)

    this.infoForStages = {
      wizardType: routeConfig.settings.wizardType,
      wizardManager: this
    }

    const targetStage = this.stages.find(stage => stage.route.includes(stageNumber))
    this.view = `${targetStage.moduleId}.html`
    console.log('TCL: WizardManager -> this.view', this.view)
    this.viewModel = targetStage.moduleId
    console.log('TCL: WizardManager -> this.viewModel', this.viewModel)
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

  // private configureRouter(config: RouterConfiguration, router: Router): void {
  //   this.wizardService.configureRouter(this, config, router);
  // }
}
