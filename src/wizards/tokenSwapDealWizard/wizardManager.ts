import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig, Router } from "aurelia-router";
import { IWizardStage, IWizardState, WizardService } from "wizards/services/WizardService";
import { DealRegistrationTokenSwap, emptyDaoDetails, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IStageMeta, STAGE_ROUTE_PARAMETER, WizardType } from "./dealWizardTypes";
import { DealService } from "services/DealService";
import { EthereumService } from "services/EthereumService";
import { Utils } from "services/utils";

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
  private tokenDetailsStage: IWizardStage = {
    name: "Token Details",
    valid: false,
    route: "token-details",
    moduleId: PLATFORM.moduleName("./stages/tokenDetailsStage/tokenDetailsStage"),
  };
  private termsStage: IWizardStage = {
    name: "Terms",
    valid: false,
    route: "terms",
    moduleId: PLATFORM.moduleName("./stages/termsStage/termsStage"),
  };
  private openProposalStages: IWizardStage[] = [
    this.proposalStage,
    this.leadDetailsStage,
    this.primaryDaoStage,
    this.tokenDetailsStage,
    this.termsStage,
  ];
  private partneredDealStages: IWizardStage[] = [
    this.proposalStage,
    this.leadDetailsStage,
    this.primaryDaoStage,
    this.partnerDaoStage,
    this.tokenDetailsStage,
    this.termsStage,
  ];

  constructor(
    private wizardService: WizardService,
    private dealService: DealService,
    private ethereumService: EthereumService,
    private router: Router,
    private eventAggregator: EventAggregator,
  ) {
  }

  async activate(params: {[STAGE_ROUTE_PARAMETER]: string, id?: string}, routeConfig: RouteConfig): Promise<void> {
    if (!params[STAGE_ROUTE_PARAMETER]) return;

    const stageRoute = params[STAGE_ROUTE_PARAMETER];
    const wizardType = routeConfig.settings.wizardType;

    // if we are accessing an already existing deal, get its registration data
    this.registrationData = params.id ? await this.getDeal(params.id) : new DealRegistrationTokenSwap(wizardType === WizardType.createPartneredDeal);

    if (wizardType === WizardType.makeAnOffer) {
      this.registrationData.partnerDAO = emptyDaoDetails;
    }

    await this.ensureAccess(wizardType);

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
      case WizardType.createOpenProposal:
      case WizardType.createPartneredDeal:
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
      case WizardType.createPartneredDeal:
      case WizardType.makeAnOffer:
      case WizardType.editPartneredDeal:
        stages = this.partneredDealStages;
        break;

      default:
        stages = this.openProposalStages;
        break;
    }

    return stages;
  }

  private async getDeal(id: string): Promise<IDealRegistrationTokenSwap> {
    await this.dealService.ensureInitialized();
    const deal = this.dealService.deals.get(id);

    if (!deal) {
      this.eventAggregator.publish("handleFailure", "Deal does not exist");
      throw new Error("Deal does not exist");
    }

    await deal.ensureInitialized();
    return JSON.parse(JSON.stringify(deal.registrationData));
  }

  private async ensureAccess(wizardType: any): Promise<void> {
    if (wizardType !== WizardType.editOpenProposal && wizardType !== WizardType.editPartneredDeal) {
      return;
    }

    try {
      await Utils.waitUntilTrue(() => !!this.ethereumService.defaultAccountAddress, 5000);

      if (this.registrationData.proposalLead.address !== this.ethereumService.defaultAccountAddress) {
        throw new Error();
      }
    } catch (error) {
      this.router.navigate(this.getPreviousRoute(wizardType));
      throw new Error();
    }
  }
}
