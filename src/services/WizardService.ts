import { autoinject } from "aurelia-framework";
import { Router, RouterConfiguration, NavigationInstruction, RouterEvent } from "aurelia-router";
import { EventAggregator } from "aurelia-event-aggregator";

export interface IWizardState<Data = any> {
  stages: Array<IWizardStage>;
  indexOfActive: number;
  registrationData: Data;
}

export type WizardErrors<Model> = Partial<Record<keyof Model, string>>;

export interface IWizardStage {
  name: string;
  valid: boolean;
  route: string;
  moduleId: any
  settings?: {[key: string]: any};
  validate?: () => boolean;
}

@autoinject
export class WizardService {
  private wizardsStates = new Map<any, IWizardState>();

  constructor(private eventAggregator: EventAggregator, private router: Router){}

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
    // const stageConfig = this.wizardsStates.get(wizardManager);

    // const routes = stageConfig.stages.map(stage => ({
    //   route: [stage.route],
    //   nav: true,
    //   moduleId: stage.moduleId,
    //   name: stage.name,
    //   settings: {
    //     wizardManager: wizardManager,
    //     ...stage.settings,
    //   },
    // }));

    // config.map(routes);

    // this.router = router;

    // this.eventAggregator.subscribeOnce(RouterEvent.Complete, (event: { instruction: NavigationInstruction }) => {
    //   this.updateIndexOfActiveBaseOnRoute(wizardManager, event.instruction.params.childRoute);
    // });

  }

  public getWizardState<Data>(wizardManager: any): IWizardState<Data> {
    console.log('1. TCL: this.wizardsStates', this.wizardsStates)
    return this.wizardsStates.get(wizardManager);
  }

  public getActiveStage(wizardManager: any): IWizardStage {
    const wizardState = this.getWizardState(wizardManager);
    return wizardState.stages[wizardState.indexOfActive];
  }

  public updateStageValidity(wizardManager: any, valid: boolean) {
    this.getActiveStage(wizardManager).valid = valid;
  }

  public registerStageValidateFunction(
    wizardManager: any,
    validate: () => boolean,
  ) {
    const stage = this.getActiveStage(wizardManager);
    stage.validate = validate;
  }

  public cancel(): void {
    this.router.parent.navigate("home");
  }

  public proceed(wizardManager: any): void {
    const wizardState = this.getWizardState(wizardManager);
    const indexOfActive = wizardState.indexOfActive;
    wizardState.stages[indexOfActive].valid = wizardState.stages[indexOfActive].validate();

    if (!wizardState.stages[indexOfActive].valid) {
      return;
    }

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
    wizardState.indexOfActive = index;
    console.log('TCL: wizardState.stages[index].route', wizardState.stages[index].route)
    this.router.navigate(wizardState.stages[index].route);
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
