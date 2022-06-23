import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { IDealIdType } from "./../../services/DataSourceDealsTypes";
import { IWizardStage, IWizardState, WizardService } from "wizards/services/WizardService";
import {
  DealRegistrationTokenSwap,
  emptyDaoDetails,
  IDealRegistrationTokenSwap,
} from "entities/DealRegistrationTokenSwap";
import { STAGE_ROUTE_PARAMETER, WizardType } from "./dealWizardTypes";
import { DealService } from "services/DealService";
import { Address, IEthereumService } from "services/EthereumService";
import "../wizards.scss";
import { DisposableCollection } from "services/DisposableCollection";
import { IContainer, IEventAggregator } from "aurelia";
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

@processContent(autoSlot)
export class WizardManager implements IRouteableComponent {
  static routes: IRoute[] = [
    {
      path: "",
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
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private stages: IWizardStage[] = [];
  // a meta configuration passed to each stage component in the view
  // for stage components to know which wizardManger they belong to and what wizardType it is
  // public stageMeta: IStageMeta;

  // view of the currently active stage

  // view model of the currently active stage
  // public viewModel: object;
  public additionalStageMetadata: Record<string, any> [] = [];
  public dealId: IDealIdType;
  private originalRegistrationData: IDealRegistrationTokenSwap;

  constructor(
    private wizardService: WizardService,
    private dealService: DealService,
    @IEthereumService private ethereumService: IEthereumService,
    @IContainer private container: IContainer,
    @IRouter private router: IRouter,
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IDataSourceDeals private dataSourceDeals: IDataSourceDeals,
  ) {
    this.wizardService.currentWizard = this;
  }

  public onStepperClick(index: number): void {
    this.wizardService.goToStage(this, index, false);
  }

}
