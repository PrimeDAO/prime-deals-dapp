import { autoinject } from "aurelia-framework";
import { Router, RouterConfiguration, NavigationInstruction, RouterEvent } from "aurelia-router";
import { EventAggregator } from "aurelia-event-aggregator";

export interface IWizard {
  stages: Array<IWizardStage>;
  indexOfActive: number;
  wizardResult: IWizardResult;
}

export interface IWizardStage {
  name: string;
  valid: boolean;
  route: any;
  moduleId: any
}

export interface IWizardResult {
  version: string;
  clearState: () => void,
  [key: string]: any;
}

@autoinject
export class WizardService {
  private wizards = new Map<any, IWizard>();
  private router: Router;

  constructor(private eventAggregator: EventAggregator){}

  public registerWizard(
    wizardManager: any,
    stages: Array<IWizardStage>,
    wizardResult: IWizardResult,
  ): IWizard {
    this.wizards.set(
      wizardManager,
      {
        stages,
        indexOfActive: 0,
        wizardResult,
      },
    );

    return this.getWizard(wizardManager);
  }

  public configureRouter(
    wizardManager: any,
    config: RouterConfiguration,
    router: Router,
  ): void {
    const stageConfig = this.wizards.get(wizardManager);

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

    this.eventAggregator.subscribeOnce(RouterEvent.Complete, (event: { instruction: NavigationInstruction }) => {
      this.updateIndexOfActiveBaseOnRoute(wizardManager, event.instruction.params.childRoute);
    });

  }

  public getWizard(wizardManager: any): IWizard {
    return this.wizards.get(wizardManager);
  }

  public getCurrentStage(wizardManager: any): IWizardStage {
    const wizard = this.getWizard(wizardManager);
    return wizard.stages[wizard.indexOfActive];
  }

  public cancel(): void {
    this.router.parent.navigate("home");
  }

  public proceed(wizardManager: any, valid: boolean): void {
    if (!valid) {
      return;
    }
    const wizard = this.getWizard(wizardManager);
    const indexOfActive = wizard.indexOfActive;

    if (indexOfActive < wizard.stages.length - 1) {
      this.goToStage(wizardManager, indexOfActive + 1);
    }
  }

  public previous(wizardManager: any): void {
    const indexOfActive = this.getWizard(wizardManager).indexOfActive;

    if (indexOfActive > 0) {
      this.goToStage(wizardManager, indexOfActive - 1);
    } else {
      this.router.parent.navigate("initiate");
    }
  }

  // public submit(wizardManager: any, valid: boolean): void {
  //   console.log("submit", wizardManager, valid);
  // }

  public goToStage(wizardManager: any, index: number): void {
    const wizard = this.getWizard(wizardManager);
    this.router.navigate(wizard.stages[index].route);
    wizard.indexOfActive = index;
  }

  private updateIndexOfActiveBaseOnRoute(wizardManager: any, stageRoute: string): void {
    const wizard = this.getWizard(wizardManager);
    wizard.indexOfActive = wizard.stages.findIndex(
      stage => stage.route === stageRoute,
    );
  }

  private getWizardStage(wizardManager: any, stageName: string): IWizardStage{
    return this.getWizard(wizardManager).stages.find(stage => stage.name === stageName);
  }
}
