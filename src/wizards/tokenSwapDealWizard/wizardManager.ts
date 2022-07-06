import { IValidationController } from "@aurelia/validation-html";
import { newInstanceForScope } from "@aurelia/kernel";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { IDealIdType } from "./../../services/DataSourceDealsTypes";
import {
  DealRegistrationTokenSwap,
  emptyDaoDetails,
  IDealRegistrationTokenSwap,
} from "entities/DealRegistrationTokenSwap";
import { STAGE_ROUTE_PARAMETER, WizardType } from "./dealWizardTypes";
import { DealService } from "services/DealService";
import { Address, fromWei, IEthereumService } from "services/EthereumService";
import "../wizards.scss";
import { DisposableCollection } from "services/DisposableCollection";
import { IContainer, IEventAggregator, Registration, singleton } from "aurelia";
import { IRoute, IRouteableComponent, IRouter, RoutingInstruction } from "@aurelia/router";

import { processContent, watch } from "@aurelia/runtime-html";
import { autoSlot } from "../../resources/temporary-code";
import { ProposalStage } from "./stages/proposalStage/proposalStage";
import { LeadDetailsStage } from "./stages/leadDetailsStage/leadDetailsStage";
import { PrimaryDaoStage } from "./stages/primaryDaoStage/primaryDaoStage";
import { PartnerDaoStage } from "./stages/partnerDaoStage/partnerDaoStage";
import { TokenDetailsStage } from "./stages/tokenDetailsStage/tokenDetailsStage";
import { TermsStage } from "./stages/termsStage/termsStage";
import { SubmitStage } from "./stages/submitStage/submitStage";
import { TokenService } from "../../services";
import { IWizardStage } from "wizards/services/WizardService";
import { PrimeErrorPresenter } from "resources/elements/primeDesignSystem/validation/primeErrorPresenter";

export class WizardManager implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: "",
      title: "Proposal",
      viewport: "stages",
      component: ProposalStage,
    },
    {
      path: "proposal",
      title: "Proposal",
      viewport: "stages",
      component: ProposalStage,
    },
    {
      path: "lead-details",
      title: "Lead Details",
      viewport: "stages",
      component: LeadDetailsStage,
    },
    {
      path: "primary-dao",
      title: "Primary DAO",
      viewport: "stages",
      component: PrimaryDaoStage,
    },
    {
      path: "partner-dao",
      title: "Partner DAO",
      viewport: "stages",
      component: PartnerDaoStage,
    },
    {
      path: "token-details",
      title: "Token Details",
      viewport: "stages",
      component: TokenDetailsStage,
    },
    {
      path: "terms",
      title: "Terms",
      viewport: "stages",
      component: TermsStage,
    },
    {
      path: "submit",
      title: "Submit",
      viewport: "stages",
      component: SubmitStage,
    },
  ];

  public additionalStageMetadata: Record<string, any>[] = [];
  public dealId: IDealIdType;
  private wizardType: WizardType;
  private stages: IWizardStage[] = [];
  private registrationData: IDealRegistrationTokenSwap;
  private originalRegistrationData: IDealRegistrationTokenSwap;
  private subscriptions = new DisposableCollection();

  private proposalStage: IWizardStage = {
    name: "Proposal",
    valid: false,
    route: "proposal",
  };
  private leadDetailsStage: IWizardStage = {
    valid: false,
    route: "lead-details",
  };
  private primaryDaoStage: IWizardStage = {
    valid: false,
    route: "primary-dao",
  };
  private partnerDaoStage: IWizardStage = {
    valid: false,
    route: "partner-dao",
  };
  private tokenDetailsStage: IWizardStage = {
    valid: false,
    route: "token-details",
  };
  private termsStage: IWizardStage = {
    valid: false,
    route: "terms",
  };
  private submitStage: IWizardStage = {
    valid: false,
    hidden: true,
    route: "submit",
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
  activeIndex: number;
  root: any;

  constructor(
    private dealService: DealService,
    private tokenService: TokenService,
    @IEventAggregator private readonly event: IEventAggregator,
    @IEthereumService private ethereumService: IEthereumService,
    @IContainer private container: IContainer,
    @IRouter private readonly router: IRouter,
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IDataSourceDeals private dataSourceDeals: IDataSourceDeals,
    @newInstanceForScope(IValidationController) private controller: IValidationController,
    private readonly presenter: PrimeErrorPresenter,
  ) {
    controller.addSubscriber(this.presenter);

  }

  public async canLoad(params: { [STAGE_ROUTE_PARAMETER]: string, id?: IDealIdType }, instruction: RoutingInstruction): Promise<boolean> {
    let canActivate = true;

    const dealId = params.id;
    /**
     * unless we are editing an existing deal there is nothing further to check
     */
    if (dealId) {
      if (!this.originalRegistrationData) {
        this.originalRegistrationData = await this.getDeal(dealId);
      }
      /**
       * app.ts is assumed to make sure that if there is going to be a connection on startup,
       * it will already have been made.
       *
       * We have to check this on every activation to handle the case of using browser navigation functions
       * and changing
       */
      canActivate = this.ensureAccess(instruction.parameters.parametersRecord.wizardType, this.ethereumService.defaultAccountAddress);
    }

    return canActivate;
  }

  public previous() {
    if (this.activeIndex < 1) return;
    this.onStepperClick(this.activeIndex - 1);
  }

  public async next() {
    const result = await this.controller.validate();
    if (!result.valid) {
      this.eventAggregator.publish("handleValidationError", "Unable to proceed, please check the page for validation errors");
      return;
    }
    this.activeIndex++;
    this.router.load(this.root.replace(/\/+$/g, "") + "/" + this.stages[this.activeIndex].route);
  }

  /**
   * This viewmodel is a singleton as long as we stay inside the wizard.  Leave the wizard and we start all over again with
   * a new viewmodel which will need to reinitialize and register itself with the wizardService.
   *
   * activate will be invoked when we enter the wizard and everytime we switch stages in the wizard. The only time
   * we need to do all the initialization is the first time.
   */
  public async load(params: { [STAGE_ROUTE_PARAMETER]: string, id?: IDealIdType }, instruction: RoutingInstruction): Promise<void> {
    this.root = instruction.route.matching;
    const stageRoute = instruction.route.remaining;

    const wizardType = instruction.parameters.parametersRecord.wizardType as number;

    this.wizardType = wizardType;
    this.dealId = params.id;

    this.registrationData = this.originalRegistrationData ?
      JSON.parse(JSON.stringify(this.originalRegistrationData))
      :
      new DealRegistrationTokenSwap(wizardType === WizardType.createPartneredDeal);

    this.container.register(Registration.instance("registrationData", this.registrationData));

    if (wizardType === WizardType.makeAnOffer) {
      this.registrationData.partnerDAO = emptyDaoDetails();
      this.registrationData.isPrivate = this.registrationData.offersPrivate;
    }

    this.stages = this.configureStages(wizardType);

    this.stages.forEach(stage => {
      stage.name = stage.name ?? WizardManager.routes.find(route => route.path === stage.route)?.title;
    });

    if (this.isHiddenStage(stageRoute)) {
      this.router.load(this.getPreviousRoute(wizardType));
      throw new Error("Not a valid URL");
    }

    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", (account: Address): void => {
      this.ensureAccess(wizardType, account);
    }));

    // Getting the index of currently active stage route.
    // It is passed to the wizardService registerWizard method to register it with correct indexOfActive
    this.activeIndex = this.stages.findIndex(stage => stage.route.includes(stageRoute));
  }

  public unload() {
    this.subscriptions.dispose();
  }

  public async onStepperClick(index: number) {
    if (this.activeIndex === index) return;
    if (index < this.activeIndex || (await this.controller.validate()).valid) {

      this.activeIndex = index;
      this.router.load(this.root.replace(/\/$/, "") + "/" + this.stages[index].route);
    }

  }

  private getPreviousRoute(wizardType: WizardType) {
    switch (wizardType) {
      case WizardType.createOpenProposal:
      case WizardType.createPartneredDeal:
        return "initiate/token-swap";

      default:
        return "/";
    }
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

    return stages;
  }

  private async getDeal(id: string): Promise<IDealRegistrationTokenSwap> {
    const deal = this.dealService.deals.get(id);

    if (!deal) {
      this.eventAggregator.publish("handleFailure", "Deal does not exist");
      throw new Error("Deal does not exist");
    }

    return deal.registrationData;
  }

  private ensureAccess(wizardType: any, account: Address): boolean {
    let canAccess = true;

    if ((wizardType === WizardType.editOpenProposal) || (wizardType === WizardType.editPartneredDeal)) {
      if (this.originalRegistrationData.proposalLead.address !== account || !this.dataSourceDeals.isUserAuthenticatedWithAddress(account)) {
        this.eventAggregator.publish("handleFailure", "Sorry, you are not authorized to modify this deal");
        canAccess = false;
        this.router.load("/");
      }
    }

    return canAccess;
  }

  private isHiddenStage(stageRoute: string): boolean {
    const hiddenStage = this.stages.findIndex(stage => stage.route === stageRoute && stage.hidden);
    const isHidden = hiddenStage !== -1;
    return isHidden;
  }

}
