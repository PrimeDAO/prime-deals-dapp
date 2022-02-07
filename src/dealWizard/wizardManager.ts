import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig } from "aurelia-router";
import { IWizardStage, IWizardState, WizardService } from "services/WizardService";
import { DealRegistrationTokenSwap, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IStageMeta, STAGE_ROUTE_PARAMETER, WizardType } from "./dealWizardTypes";
import { DealService } from "services/DealService";
import { ValidationControllerFactory } from "aurelia-validation";

@autoinject
export class WizardManager {
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  // a meta configuration passed to each stage component in the view
  // for stage components to know which wizardManger they belong to and what wizardType it is
  public stageMeta: IStageMeta;

  // view of the currently active stage
  public view: string;

  // view model of the currently active stage
  public viewModel: string;

  private stages: IWizardStage[] = [];
  private registrationData: IDealRegistrationTokenSwap;
  private proposalStage: IWizardStage = {
    name: "Proposal",
    valid: false,
    route: "proposal",
    moduleId: PLATFORM.moduleName("./stages/proposalStage/proposalStage"),
  };
  private leadDetailsStage: IWizardStage = {
    name: "Lead Details",
    valid: false,
    route: "lead-details",
    moduleId: PLATFORM.moduleName("./stages/leadDetailsStage/leadDetailsStage"),
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
    this.leadDetailsStage,
    this.primaryDaoStage,
  ];
  private partneredDealStages: IWizardStage[] = [
    this.proposalStage,
    this.leadDetailsStage,
    this.primaryDaoStage,
    this.partnerDaoStage,
  ];

  constructor(
    private wizardService: WizardService,
    private dealService: DealService,
    private validationFactory: ValidationControllerFactory,
  ) {
  }

  activate(params: {[STAGE_ROUTE_PARAMETER]: string, id?: string}, routeConfig: RouteConfig): void {
    if (!params[STAGE_ROUTE_PARAMETER]) return;

    const stageRoute = params[STAGE_ROUTE_PARAMETER];
    const wizardType = routeConfig.settings.wizardType;

    // if we are accessing an already existing deal, get its registration data
    this.registrationData = params.id ? this.getDeal(params.id) : new DealRegistrationTokenSwap();

    this.stages = this.configureStages(wizardType);

    // Getting the index of currently active stage route.
    // It is passed to the wizardService registerWizard method to register it with correct indexOfActive
    const indexOfActiveStage = this.stages.findIndex(stage => stage.route.includes(stageRoute));

    this.setupStageComponent(indexOfActiveStage, wizardType);

    this.wizardState = this.wizardService.registerWizard({
      wizardManager: this,
      stages: this.stages,
      indexOfActive: indexOfActiveStage,
      registrationData: this.registrationData,
      cancelRoute: "home",
      previousRoute: this.getPreviousRoute(wizardType),
    });
  }

  private getPreviousRoute(wizardType: WizardType) {
    switch (wizardType) {
      case WizardType.openProposal:
      case WizardType.partneredDeal:
        return "initiate/token-swap";

      default:
        return "home";
    }
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private setupStageComponent(indexOfActiveStage: number, wizardType: WizardType) {
    this.stageMeta = {
      wizardType,
      wizardManager: this,
    };

    const activeStage = this.stages[indexOfActiveStage];
    this.view = `${activeStage.moduleId}.html`;
    this.viewModel = activeStage.moduleId;
  }

  private configureStages(wizardType: WizardType) {
    let stages: IWizardStage[];
    switch (wizardType) {
      case WizardType.partneredDeal:
      case WizardType.makeAnOffer:
      case WizardType.partneredDealEdit:
        stages = this.partneredDealStages;
        break;

      default:
        stages = this.openProposalStages;
        break;
    }

    return stages;
  }

  private getDeal(id: string): IDealRegistrationTokenSwap {
    return this.dealService.deals.get(id).registrationData;
  }
}
