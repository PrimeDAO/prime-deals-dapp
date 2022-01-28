import { autoinject } from "aurelia-framework";
import { Router, RouterConfiguration, NavigationInstruction, RouterEvent } from "aurelia-router";
import { EventAggregator } from "aurelia-event-aggregator";

export interface IWizardState<Data = any> {
  stages: Array<IWizardStage>;
  indexOfActive: number;
  registrationData: Data;
}

export interface IWizardStage {
  name: string;
  valid: boolean;
  route: any;
  moduleId: any
  settings?: {[key: string]: any};
}

@autoinject
export class WizardService {
  private wizardsStates = new Map<any, IWizardState>();
  private router: Router;

  constructor(private eventAggregator: EventAggregator){}

  public registerWizard<Data>(
    wizardManager: any,
    stages: Array<IWizardStage>,
    registrationData: Data,
  ): IWizardState<Data> {
    this.wizardsStates.set(
      wizardManager,
      {
        stages,
        indexOfActive: 0,
        registrationData,
      },
    );

    return this.getWizardState(wizardManager);
  }

  public configureRouter(
    wizardManager: any,
    config: RouterConfiguration,
    router: Router,
  ): void {
    const stageConfig = this.wizardsStates.get(wizardManager);

    const routes = stageConfig.stages.map(stage => ({
      route: [stage.route],
      nav: true,
      moduleId: stage.moduleId,
      name: stage.name,
      settings: {
        wizardManager: wizardManager,
        ...stage.settings,
      },
    }));

    config.map(routes);

    this.router = router;

    this.eventAggregator.subscribeOnce(RouterEvent.Complete, (event: { instruction: NavigationInstruction }) => {
      this.updateIndexOfActiveBaseOnRoute(wizardManager, event.instruction.params.childRoute);
    });

  }

  public getWizardState<Data>(wizardManager: any): IWizardState<Data> {
    return this.wizardsStates.get(wizardManager);
  }

  public getActiveStage(wizardManager: any): IWizardStage {
    const wizardState = this.getWizardState(wizardManager);
    return wizardState.stages[wizardState.indexOfActive];
  }

  public updateStageValidity(wizardManager: any, valid: boolean) {
    this.getActiveStage(wizardManager).valid = valid;
  }

  public cancel(): void {
    this.router.parent.navigate("home");
  }

  public proceed(wizardManager: any, valid: boolean): void {
    if (!valid) {
      return;
    }
    const wizardState = this.getWizardState(wizardManager);
    const indexOfActive = wizardState.indexOfActive;

    if (indexOfActive < wizardState.stages.length - 1) {
      this.goToStage(wizardManager, indexOfActive + 1);
    }
  }

  public previous(wizardManager: any): void {
    const indexOfActive = this.getWizardState(wizardManager).indexOfActive;

    if (indexOfActive > 0) {
      this.goToStage(wizardManager, indexOfActive - 1);
    } else {
      this.router.parent.navigate("initiate/token-swap");
    }
  }

  public submit(wizardManager: any, valid: boolean): void {
    // eslint-disable-next-line no-console
    console.log("submit", wizardManager, valid);
  }

  public goToStage(wizardManager: any, index: number): void {
    const wizardState = this.getWizardState(wizardManager);
    this.router.navigate(wizardState.stages[index].route);
    wizardState.indexOfActive = index;
  }

  private updateIndexOfActiveBaseOnRoute(wizardManager: any, stageRoute: string): void {
    const wizardState = this.getWizardState(wizardManager);
    wizardState.indexOfActive = wizardState.stages.findIndex(
      stage => stage.route === stageRoute,
    );
  }

  private getWizardStage(wizardManager: any, stageName: string): IWizardStage{
    return this.getWizardState(wizardManager).stages.find(stage => stage.name === stageName);
  }
}
