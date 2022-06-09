import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { IDealIdType } from "./../../services/DataSourceDealsTypes";
import { IWizardStage, IWizardState, WizardService } from "wizards/services/WizardService";
import {
  DealRegistrationTokenSwap,
  emptyDaoDetails,
  IDealRegistrationTokenSwap,
} from "entities/DealRegistrationTokenSwap";
import { IStageMeta, STAGE_ROUTE_PARAMETER, WizardType } from "./dealWizardTypes";
import { DealService } from "services/DealService";
import { Address, IEthereumService } from "services/EthereumService";
import "../wizards.scss";
import { DisposableCollection } from "services/DisposableCollection";
import { IEventAggregator } from "aurelia";
import { IRouter, IRouteableComponent, RoutingInstruction} from "@aurelia/router";

import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../resources/temporary-code";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationController } from "@aurelia/validation-html";
import { PrimeErrorPresenter } from "../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";

@processContent(autoSlot)
export class WizardManager implements IRouteableComponent {
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  // a meta configuration passed to each stage component in the view
  // for stage components to know which wizardManger they belong to and what wizardType it is
  public stageMeta: IStageMeta;

  // view of the currently active stage

  // view model of the currently active stage
  public viewModel: object;
  public additionalStageMetadata: Record < string, any > [] =[];
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
    moduleId: import("./stages/proposalStage/proposalStage").then(c => c.ProposalStage),
  };
  private leadDetailsStage: IWizardStage = {
    name: "Lead Details",
    valid: false,
    route: "lead-details",
    moduleId: import("./stages/leadDetailsStage/leadDetailsStage").then(c => c.LeadDetailsStage),
  };
  private primaryDaoStage: IWizardStage = {
    name: "Primary DAO",
    valid: false,
    route: "primary-dao",
    moduleId: import("./stages/primaryDaoStage/primaryDaoStage").then(c => c.PrimaryDaoStage),
  };
  private partnerDaoStage: IWizardStage = {
    name: "Partner DAO",
    valid: false,
    route: "partner-dao",
    moduleId: import("./stages/partnerDaoStage/partnerDaoStage").then(c => c.PartnerDaoStage),
  };
  private tokenDetailsStage: IWizardStage = {
    name: "Token Details",
    valid: false,
    route: "token-details",
    moduleId: import("./stages/tokenDetailsStage/tokenDetailsStage").then(c => c.TokenDetailsStage),
  };
  private termsStage: IWizardStage = {
    name: "Terms",
    valid: false,
    route: "terms",
    moduleId: import("./stages/termsStage/termsStage").then(c => c.TermsStage),
  };
  private submitStage: IWizardStage = {
    name: "Submit",
    valid: false,
    hidden: true,
    route: "submit",
    moduleId: import("./stages/submitStage/submitStage").then(c => c.SubmitStage),
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
    @IEthereumService private ethereumService: IEthereumService,
    @IRouter private router: IRouter,
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IDataSourceDeals private dataSourceDeals: IDataSourceDeals,
    @newInstanceForScope(IValidationController) private form: IValidationController,
    private presenter: PrimeErrorPresenter,
  ) {
    this.form.addSubscriber(presenter);
  }

  public async canLoad(params: { [STAGE_ROUTE_PARAMETER]: string, id?: IDealIdType }, instruction: RoutingInstruction): Promise < boolean > {
    let canActivate = true;

    if (!params[STAGE_ROUTE_PARAMETER]) {
      canActivate = false;
    } else {

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
  }

  /**
   * This viewmodel is a singleton as long as we stay inside the wizard.  Leave the wizard and we start all over again with
   * a new viewmodel which will need to reinitialize and register itself with the wizardService.
   *
   * activate will be invoked when we enter the wizard and everytime we switch stages in the wizard. The only time
   * we need to do all the initialization is the first time.
   */
  public async load(params: { [STAGE_ROUTE_PARAMETER]: string, id?: IDealIdType }, instruction: RoutingInstruction): Promise < void> {
    const stageRoute = params[STAGE_ROUTE_PARAMETER];

    const wizardType = Number(instruction.parameters.parametersRecord.wizardType);

    if (!this.wizardService.hasWizard(this)) {

      this.wizardType = wizardType;
      this.dealId = params.id;

      this.registrationData = this.originalRegistrationData ?
        JSON.parse(JSON.stringify(this.originalRegistrationData))
        :
        new DealRegistrationTokenSwap(wizardType === WizardType.createPartneredDeal);

      if (wizardType === WizardType.makeAnOffer) {
        this.registrationData.partnerDAO = emptyDaoDetails();
        this.registrationData.isPrivate = this.registrationData.offersPrivate;
      }

      this.stages = this.configureStages(wizardType);

      if (this.isHiddenStage(stageRoute)) {
        this.router.load(this.getPreviousRoute(wizardType));
        throw new Error("Not a valid URL");
      }

      this.wizardState = this.wizardService.registerWizard({
        wizardStateKey: this,
        stages: this.stages,
        registrationData: this.registrationData,
        cancelRoute: "home",
        previousRoute: this.getPreviousRoute(wizardType),
      });
    }

    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", (account: Address): void => {
      this.ensureAccess(wizardType, account);
    }));

    // Getting the index of currently active stage route.
    // It is passed to the wizardService registerWizard method to register it with correct indexOfActive
    const indexOfActiveStage = this.stages.findIndex(stage => stage.route.includes(stageRoute));

    await this.setupStageComponent(indexOfActiveStage, wizardType);

    this.wizardService.setActiveStage(this, indexOfActiveStage);
  }

  public unload() {
    this.subscriptions.dispose();
  }

  public onStepperClick(index: number): void {
    this.wizardService.goToStage(this, index, false);
  }

  async validate() {
    const result = await this.form.validate();
    console.log("validation result ->", result);
    return result.results.length === 0;
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

  private async setupStageComponent(indexOfActiveStage: number, wizardType: WizardType) {
    this.additionalStageMetadata[indexOfActiveStage] = this.additionalStageMetadata[indexOfActiveStage] ?? {};

    this.stageMeta = {
      wizardType,
      wizardManager: this,
      settings: this.additionalStageMetadata[indexOfActiveStage],
    };

    // const activeStage = this.stages[indexOfActiveStage];
    // this.view = activeStage.moduleId;
    this.viewModel = await this.stages[indexOfActiveStage].moduleId;
  }

  private configureStages(wizardType: WizardType): Array < IWizardStage > {
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
        // stages.map((stage) => {
        //   stage.valid = (stage !== this.partnerDaoStage && stage !== this.tokenDetailsStage) ? true : undefined;
        // });
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

  private async getDeal(id: string): Promise < IDealRegistrationTokenSwap > {
    await this.dealService.ensureInitialized();
    const deal = this.dealService.deals.get(id);

    if (!deal) {
      this.eventAggregator.publish("handleFailure", "Deal does not exist");
      throw new Error("Deal does not exist");
    }

    await deal.ensureInitialized();
    return deal.registrationData;
  }

  private ensureAccess(wizardType: any, account: Address): boolean {
    let canAccess = true;

    if ((wizardType === WizardType.editOpenProposal) || (wizardType === WizardType.editPartneredDeal)) {
      if (this.originalRegistrationData.proposalLead.address !== account || !this.dataSourceDeals.isUserAuthenticatedWithAddress(account)) {
        this.eventAggregator.publish("handleFailure", "Sorry, you are not authorized to modify this deal");
        canAccess = false;
        this.router.load("/home");
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
