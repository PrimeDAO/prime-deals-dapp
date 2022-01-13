import { autoinject } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import { IWizardResult, IWizardStage } from "../dealWizard/dealWizard.types";

export interface IWizardConfig {
  stages: Array<IWizardStage>;
  indexOfActive: number;
  wizardResult: IWizardResult;
}

@autoinject
export class DealWizardService {
  private dealWizards = new Map<any, IWizardConfig>();
  private router: Router;

  public registerWizard(
    key: any,
    stages: Array<IWizardStage>,
    wizardResult: IWizardResult,
  ): void {
    this.dealWizards.set(
      key,
      {
        stages,
        indexOfActive: 0,
        wizardResult,
      },
    );
  }

  public configureRouter(
    wizardManager: any,
    config: RouterConfiguration,
    router: Router,
  ): void {
    const stageConfig = this.dealWizards.get(wizardManager);

    const routes = stageConfig.stages.map(stage => ({
      route: [stage.route],
      nav: true,
      moduleId: stage.moduleId,
      name: stage.name,
      settings: {
        wizardManager: wizardManager,
      },
    }));

    config.map(routes);

    this.router = router;
  }

  public getWizard(wizardManager: any): IWizardConfig {
    return this.dealWizards.get(wizardManager);
  }

  public getWizardStage(wizardManager: any, stageName: string): IWizardStage{
    return this.getWizard(wizardManager).stages.find(stage => stage.name === stageName);
  }

  public cancel(): void {
    this.router.parent.navigate("home");
  }

  public proceed(wizardManager: any): void {
    const wizard = this.getWizard(wizardManager);
    const indexOfActive = wizard.indexOfActive;

    if (indexOfActive < wizard.stages.length - 1) {
      this.goToStage(wizardManager, indexOfActive + 1);
    }
  }

  public previous(wizardManager: any) {
    const indexOfActive = this.getWizard(wizardManager).indexOfActive;

    if (indexOfActive > 0) {
      this.goToStage(wizardManager, indexOfActive - 1);
    } else {
      this.router.parent.navigate("initiate");
    }
  }

  public goToStage(wizardManager: any, index: number): void {
    const wizard = this.getWizard(wizardManager);
    this.router.navigate(wizard.stages[index].route);
    wizard.indexOfActive = index;
  }

  public updateIndexOfActiveBaseOnRoute(wizardManager: any): void {
    const wizard = this.getWizard(wizardManager);
    wizard.indexOfActive = wizard.stages.findIndex(
      stage => stage.route === this.router.currentInstruction.fragment,
    );
  }
}
