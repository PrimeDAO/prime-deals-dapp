import { IDealIdType } from "./../../services/DataSourceDealsTypes";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig, Router } from "aurelia-router";
import { IWizardStage, IWizardState, WizardService } from "wizards/services/WizardService";
import {
  DealRegistrationTokenSwap,
  emptyDaoDetails,
  IDealRegistrationTokenSwap,
} from "entities/DealRegistrationTokenSwap";
import { IStageMeta, STAGE_ROUTE_PARAMETER, WizardType } from "./dealWizardTypes";
import { DealService } from "services/DealService";
import { Address, EthereumService } from "services/EthereumService";
import "../wizards.scss";
import { DisposableCollection } from "services/DisposableCollection";

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
  public additionalStageMetadata: Record<string, any>[] = [];

  private wizardType: WizardType;
  public dealId: IDealIdType;

  private stages: IWizardStage[] = [];
  private registrationData: IDealRegistrationTokenSwap;
  private subscriptions = new DisposableCollection();

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
  private submitStage: IWizardStage = {
    name: "Submit",
    valid: false,
    hidden: true,
    route: "submit",
    moduleId: PLATFORM.moduleName("./stages/submitStage/submitStage"),
  };
  private openProposalStages: IWizardStage[] = [
    this.proposalStage,
    this.leadDetailsStage,
    this.primaryDaoStage,
    this.tokenDetailsStage,
    this.termsStage,
    this.submitStage,
  ];
  private partneredDealStages: IWizardStage[] = [
    this.proposalStage,
    this.leadDetailsStage,
    this.primaryDaoStage,
    this.partnerDaoStage,
    this.tokenDetailsStage,
    this.termsStage,
    this.submitStage,
  ];

  constructor(
    private wizardService: WizardService,
    private dealService: DealService,
    private ethereumService: EthereumService,
    private router: Router,
    private eventAggregator: EventAggregator,
  ) {
  }

  public async activate(params: {[STAGE_ROUTE_PARAMETER]: string, id?: IDealIdType}, routeConfig: RouteConfig): Promise<void> {
    if (!params[STAGE_ROUTE_PARAMETER]) return;

    const stageRoute = params[STAGE_ROUTE_PARAMETER];
    const wizardType = routeConfig.settings.wizardType;

    // if we are accessing an already existing deal, get its registration data
    const dealId = params.id;

    if ((wizardType !== this.wizardType) || (dealId !== this.dealId)) {

      this.wizardType = wizardType;
      this.dealId = dealId;

      this.registrationData = dealId ? await this.getDeal(dealId) : new DealRegistrationTokenSwap(wizardType === WizardType.createPartneredDeal);

      if (wizardType === WizardType.makeAnOffer) {
        this.registrationData.partnerDAO = emptyDaoDetails();
      }

      /**
       * app.ts is assumed to make sure that if there is going to be a connection on startup,
       * it will already have been made.
       */
      this.ensureAccess(wizardType, this.ethereumService.defaultAccountAddress);

      this.stages = this.configureStages(wizardType);

      if (this.isHiddenStage(stageRoute)) {
        this.router.navigate(this.getPreviousRoute(wizardType));
        throw new Error("Not a valid URL");
      }

      this.wizardState = this.wizardService.registerWizard({
        wizardStateKey: this,
        stages: this.stages,
        registrationData: this.registrationData,
        cancelRoute: "home",
        previousRoute: this.getPreviousRoute(wizardType),
      });

      this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", (account: Address): void => {
        this.ensureAccess(wizardType, account);
      }));
    }

    // Getting the index of currently active stage route.
    // It is passed to the wizardService registerWizard method to register it with correct indexOfActive
    const indexOfActiveStage = this.stages.findIndex(stage => stage.route.includes(stageRoute));

    this.setupStageComponent(indexOfActiveStage, wizardType);

    this.wizardService.setActiveStage(this, indexOfActiveStage);
  }

  public deactivate() {
    this.subscriptions.dispose();
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

  public onStepperClick(index: number): void {
    this.wizardService.goToStage(this, index, false);
  }

  private setupStageComponent(indexOfActiveStage: number, wizardType: WizardType) {
    this.additionalStageMetadata[indexOfActiveStage] = this.additionalStageMetadata[indexOfActiveStage] ?? {};

    this.stageMeta = {
      wizardType,
      wizardManager: this,
      settings: this.additionalStageMetadata[indexOfActiveStage],
    };

    const activeStage = this.stages[indexOfActiveStage];
    this.view = `${activeStage.moduleId}.html`;
    this.viewModel = activeStage.moduleId;
  }

  private configureStages(wizardType: WizardType): Array<IWizardStage> {
    let stages: Array<IWizardStage>;
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

    this.setStagesAreValid(wizardType, stages);

    return stages;
  }

  private setStagesAreValid(wizardType: WizardType, stages: Array<IWizardStage>): void {
    /**
     * for any stages that have been previously checked and found valid,
     * set stage.valid to true Otherwise, set to undefined, indicating
     * they have not been checked.
     */
    switch (wizardType) {
      case WizardType.makeAnOffer:
        stages.map((stage) => {
          stage.valid = (stage !== this.partnerDaoStage && stage !== this.tokenDetailsStage) ? true : undefined;
        });
        break;
      case WizardType.editPartneredDeal:
      case WizardType.editOpenProposal:
        stages.map((stage) => stage.valid = true);
        break;
      case WizardType.createPartneredDeal:
      case WizardType.createOpenProposal:
        stages.map((stage) => stage.valid = undefined);
        break;
    }
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

  private ensureAccess(wizardType: any, account: Address): void {
    if (wizardType !== WizardType.editOpenProposal && wizardType !== WizardType.editPartneredDeal) {
      return;
    }

    if (this.registrationData.proposalLead.address !== account) {
      this.eventAggregator.publish("handleFailure", "Sorry, you are not authorized to modify this deal");
      this.router.navigate(this.getPreviousRoute(wizardType));
    }
  }

  private isHiddenStage(stageRoute: string): boolean {
    const hiddenStage = this.stages.findIndex(stage => stage.route === stageRoute && stage.hidden);
    const isHidden = hiddenStage !== -1;
    return isHidden;

  }
}
