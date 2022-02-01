import { DealService } from "services/DealService";
import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig } from "aurelia-router";
import { WizardService, IWizardState, IWizardStage } from "services/WizardService";
import { DealRegistrationData, IDealRegistrationData } from "entities/DealRegistrationData";
import { IStageMeta, WizardType, STAGE_ROUTE_PARAMETER } from "./dealWizardTypes";

const proposalStage: IWizardStage = {
  name: "Proposal",
  valid: false,
  route: "proposal",
  moduleId: PLATFORM.moduleName("./stages/proposalStage/proposalStage"),
};

const proposalLeadStage: IWizardStage = {
  name: "Lead Details",
  valid: false,
  route: "proposal-lead",
  moduleId: PLATFORM.moduleName("./openProposalWizard/openProposalProposalLeadStage/openProposalProposalLeadStage"),
};

const primaryDaoStage: IWizardStage = {
  name: "Primary DAO",
  valid: false,
  route: "primary-dao",
  moduleId: PLATFORM.moduleName("./stages/primaryDaoStage/primaryDaoStage"),
};

const partnerDaoStage: IWizardStage = {
  name: "Partner DAO",
  valid: false,
  route: "partner-dao",
  moduleId: PLATFORM.moduleName("./stages/partnerDaoStage/partnerDaoStage"),
};

@autoinject
export class WizardManager {
  public wizardState: IWizardState<IDealRegistrationData>;
  public stageMeta: IStageMeta;
  public view: string;
  public viewModel: string;
  private stages: IWizardStage[] = [];
  private registrationData = new DealRegistrationData();

  constructor(public wizardService: WizardService, private dealService: DealService) {}

  activate(params: {[STAGE_ROUTE_PARAMETER]: string, id?: string}, routeConfig: RouteConfig) {
    if (!params[STAGE_ROUTE_PARAMETER]) return;

    const wizardType = routeConfig.settings.wizardType;
    if (!this.wizardService.hasWizard(this)) {
      this.stages = this.configureStages(wizardType);
    }

    const dealId = params.id;
    let registrationData: unknown;

    if (dealId) {
      registrationData = this.getDeal(dealId);
    }

    console.log(registrationData);

    const stageRoute = params[STAGE_ROUTE_PARAMETER];
    const indexOfActive = this.stages.findIndex(stage => stage.route.includes(stageRoute));
    this.setupStageComponent(indexOfActive, wizardType);

    this.wizardState = this.wizardService.registerWizard(this, this.stages, indexOfActive, this.registrationData);
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private setupStageComponent(indexOfActive: number, wizardType: WizardType) {
    this.stageMeta = {
      wizardType,
      wizardManager: this,
    };

    const targetStage = this.stages[indexOfActive];
    this.view = `${targetStage.moduleId}.html`;
    this.viewModel = targetStage.moduleId;
  }

  private getDeal(id: string): unknown {
    return this.dealService.deals.get(id).rootData.registration as unknown;
  }

  private configureStages(wizardType: WizardType) {
    let stages: IWizardStage[];
    switch (wizardType) {
      case WizardType.partneredDeal:
      case WizardType.makeAnOffer:
        stages = this.getPartneredDealStages();
        break;

      default:
        stages = this.getOpenProposalStages();
        break;
    }

    return stages;
  }

  private getOpenProposalStages(): IWizardStage[] {
    return [
      proposalStage,
      proposalLeadStage,
      primaryDaoStage,
    ];
  }

  private getPartneredDealStages(): IWizardStage[] {
    return [
      proposalStage,
      proposalLeadStage,
      primaryDaoStage,
      partnerDaoStage,
    ];
  }
}
