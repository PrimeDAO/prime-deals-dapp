import { autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { RouteConfig } from "aurelia-router";
import { WizardService, IWizardState, IWizardStage } from "services/WizardService";
import { DealRegistrationData, IDealRegistrationData } from "entities/DealRegistrationData";
import { IStageMeta, WizardType } from "./dealWizardTypes";

@autoinject
export class WizardManager {
  public wizardState: IWizardState<IDealRegistrationData>;
  public stageMeta: IStageMeta;
  public view: string;
  public viewModel: string;
  private stages: IWizardStage[] = [{
    name: "Proposal",
    valid: false,
    route: "stage1",
    moduleId: PLATFORM.moduleName("./stages/proposalStage/proposalStage"),
  }, {
    name: "Lead Details",
    valid: false,
    route: "stage2",
    moduleId: PLATFORM.moduleName("./openProposalWizard/openProposalProposalLeadStage/openProposalProposalLeadStage"),
  }, {
    name: "Primary DAO",
    valid: false,
    route: "stage3",
    moduleId: PLATFORM.moduleName("./stages/primaryDaoStage/primaryDaoStage"),
  }];
  private registrationData = new DealRegistrationData();

  constructor(public wizardService: WizardService) {}

  activate(params: any, routeConfig: RouteConfig): void {
    if (!params.stageRoute) return;

    const { stageRoute } = params;
    const wizardType = routeConfig.settings.wizardType;
    const parentRoutePath = routeConfig.route as string;

    if (!this.wizardService.hasWizard(this)) {
      this.configureStages(wizardType, parentRoutePath);
    }

    this.stageMeta = {
      wizardType,
      wizardManager: this,
    };

    const indexOfActive = this.stages.findIndex(stage => stage.route.includes(stageRoute));
    const targetStage = this.stages[indexOfActive];
    this.view = `${targetStage.moduleId}.html`;
    this.viewModel = targetStage.moduleId;

    this.wizardState = this.wizardService.registerWizard(this, this.stages, indexOfActive, this.registrationData);
  }

  public onClick(index: number): void {
    this.wizardService.goToStage(this, index);
  }

  private configureStages(wizardType: WizardType, parentRoutePath: string) {
    switch (wizardType) {
      case WizardType.partneredDeal:
      case WizardType.makeAnOffer:
        this.stages.push({
          name: "Partner DAO",
          valid: false,
          route: "stage4",
          moduleId: PLATFORM.moduleName("./stages/partnerDaoStage/partnerDaoStage"),
        });
        break;

      default:
        break;
    }

    this.stages = this.updateStagesWithFullRoutePath(parentRoutePath);
  }

  private updateStagesWithFullRoutePath(parentRoute) {
    return this.stages.map(stage => ({
      ...stage,
      route: parentRoute.replace("*stageRoute", stage.route),
    }));
  }
}
