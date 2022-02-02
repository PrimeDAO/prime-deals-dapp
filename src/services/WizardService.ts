import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { STAGE_ROUTE_PARAMETER } from "dealWizard/dealWizardTypes";

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
  validate?: () => boolean;
}

@autoinject
export class WizardService {
  private wizardsStates = new Map<any, IWizardState>();

  constructor(private router: Router){}

  public registerWizard<Data>(
    wizardManager: any,
    stages: Array<IWizardStage>,
    indexOfActive: number,
    registrationData: Data,
  ): IWizardState<Data> {
    if (!this.hasWizard(wizardManager)) {
      this.wizardsStates.set(
        wizardManager,
        {
          stages,
          indexOfActive: indexOfActive,
          registrationData,
        },
      );
    }

    return this.getWizardState(wizardManager);
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
      this.router.navigate("initiate/token-swap");
    }
  }

  public submit(wizardManager: any, valid: boolean): void {
    // eslint-disable-next-line no-console
    console.log("submit", wizardManager, valid);
  }

  public goToStage(wizardManager: any, index: number): void {
    const wizardState = this.getWizardState(wizardManager);
    wizardState.indexOfActive = index;

    const params = {
      ...this.router.currentInstruction.params,
      [STAGE_ROUTE_PARAMETER]: wizardState.stages[index].route,
    };

    this.router.navigateToRoute(
      this.router.currentInstruction.config.name,
      params,
    );
  }
  public hasWizard(wizardManager: any): boolean {
    return this.wizardsStates.has(wizardManager);
  }

  private getWizardStage(wizardManager: any, stageName: string): IWizardStage{
    return this.getWizardState(wizardManager).stages.find(stage => stage.name === stageName);
  }
}
