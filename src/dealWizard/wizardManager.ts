import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig } from "aurelia-router";
import { WizardService, IWizardState, IWizardStage } from "services/WizardService";
import { DealRegistrationData, IDealRegistrationData } from "entities/DealRegistrationData";
import { IStageMeta, WizardType, STAGE_ROUTE_PARAMETER } from "./dealWizardTypes";

@autoinject
export class WizardManager {
  public wizardState: IWizardState<IDealRegistrationData>;

  // a meta configuration passed to each stage component in the view
  // for stage components to know which wizardManger they belong to and what wizardType it is
  public stageMeta: IStageMeta;

  // view of the currently active stage
  public view: string;

  // view model of the currently active stage
  public viewModel: string;

  private stages: IWizardStage[] = [];
  private registrationData = new DealRegistrationData();
  private proposalStage: IWizardStage = {
    name: "Proposal",
    valid: false,
    route: "proposal",
    moduleId: PLATFORM.moduleName("./stages/proposalStage/proposalStage"),
  };
  private proposalLeadStage: IWizardStage = {
    name: "Lead Details",
    valid: false,
    route: "proposal-lead",
    moduleId: PLATFORM.moduleName("./openProposalWizard/openProposalProposalLeadStage/openProposalProposalLeadStage"),
  };
  private primaryDaoStage: IWizardStage = {
    name: "Primary DAO",
    valid: false,
    route: "primary-dao",
    moduleId: PLATFORM.moduleName("./stages/primaryDaoStage/primaryDaoStage"),
  };
  private partnerDaoStage: IWizardStage = {
    name: "Partner DAO",
    valid: false,
    route: "partner-dao",
    moduleId: PLATFORM.moduleName("./stages/partnerDaoStage/partnerDaoStage"),
  };
  private openProposalStages: IWizardStage[] = [
    this.proposalStage,
    this.proposalLeadStage,
    this.primaryDaoStage,
  ];
  private partneredDealStages: IWizardStage[] = [
    this.proposalStage,
    this.proposalLeadStage,
    this.primaryDaoStage,
    this.partnerDaoStage,
  ];

  constructor(public wizardService: WizardService) {}

  activate(params: {[STAGE_ROUTE_PARAMETER]: string}, routeConfig: RouteConfig): void {
    if (!params[STAGE_ROUTE_PARAMETER]) return;

    const stageRoute = params[STAGE_ROUTE_PARAMETER];
    const wizardType = routeConfig.settings.wizardType;
    const parentRoutePath = routeConfig.route as string;

    this.stages = this.configureStages(wizardType, parentRoutePath);

    this.stageMeta = {
      wizardType,
      wizardManager: this,
    };

    // Getting the index of currently active stage route.
    // It is passed to the wizardService registerWizard method to register it with correct indexOfActive
    const indexOfActiveStage = this.stages.findIndex(stage => stage.route.includes(stageRoute));

    const activeStage = this.stages[indexOfActiveStage];
    this.view = `${activeStage.moduleId}.html`;
    this.viewModel = activeStage.moduleId;

    this.wizardState = this.wizardService.registerWizard(this, this.stages, indexOfActiveStage, this.registrationData);
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private configureStages(wizardType: WizardType, parentRoutePath: string) {
    let stages: IWizardStage[];
    switch (wizardType) {
      case WizardType.partneredDeal:
      case WizardType.makeAnOffer:
        stages = this.partneredDealStages;
        break;

      default:
        stages = this.openProposalStages;
        break;
    }

    stages = this.updateStagesWithFullRoutePath(stages, parentRoutePath);

    return stages;
  }

  private updateStagesWithFullRoutePath(stages: IWizardStage[], parentRoute) {
    return stages.map(stage => ({
      ...stage,
      route: parentRoute.replace(`*${STAGE_ROUTE_PARAMETER}`, stage.route),
    }));
  }
}
