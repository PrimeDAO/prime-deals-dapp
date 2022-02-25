import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { STAGE_ROUTE_PARAMETER } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { Rule, validateTrigger, ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { PrimeRenderer } from "resources/elements/primeDesignSystem/validation/primeRenderer";

export interface IWizardState<Data = any> {
  stages: Array<IWizardStage>;
  indexOfActive: number;
  registrationData: Data;
  cancelRoute: string;
  previousRoute: string;
}

export type WizardErrors<Model> = Partial<Record<keyof Model, string>>;

export interface IWizardStage {
  name: string;
  valid: boolean;
  route: string;
  moduleId: any
  form?: ValidationController;
  validate?: () => Promise<boolean> | boolean;
}

@autoinject
export class WizardService {
  private wizardsStates = new Map<any, IWizardState>();

  constructor(
    private router: Router,
    private eventAggregator: EventAggregator,
    private validationFactory: ValidationControllerFactory,
  ) {
  }

  public registerWizard<TData>({
    wizardManager,
    stages,
    registrationData,
    cancelRoute,
    previousRoute,
  }: {
    wizardManager: any;
    stages: Array<IWizardStage>;
    registrationData: TData;
    cancelRoute: string;
    previousRoute: string;
  }): IWizardState<TData> {
    if (!this.hasWizard(wizardManager)) {
      this.wizardsStates.set(
        wizardManager,
        {
          stages,
          indexOfActive: 0,
          registrationData,
          cancelRoute,
          previousRoute,
        },
      );
    }

    return this.getWizardState(wizardManager);
  }

  public setActiveStage(wizardManager: any, indexOfActive: number): void {
    this.wizardsStates.get(wizardManager).indexOfActive = indexOfActive;
  }

  public getWizardState<Data>(wizardManager: any): IWizardState<Data> {
    return this.wizardsStates.get(wizardManager);
  }

  // public updateStageValidity(wizardManager: any, valid: boolean) {
  //   this.getActiveStage(wizardManager).valid = valid;
  // }

  public registerStageValidateFunction(
    wizardManager: any,
    validate: () => Promise<boolean>,
  ) {
    const stage = this.getActiveStage(wizardManager);
    stage.validate = validate;
  }

  public cancel(wizardManager: any): void {
    this.router.navigate(this.getWizardState(wizardManager).cancelRoute);
  }

  public async proceed(wizardManager: any): Promise<void> {
    const wizardState = this.getWizardState(wizardManager);
    const indexOfActive = wizardState.indexOfActive;

    if (indexOfActive < wizardState.stages.length - 1) {
      this.goToStage(wizardManager, indexOfActive + 1, true);
    }
  }

  public previous(wizardManager: any): void {
    const wizardState = this.getWizardState(wizardManager);
    const indexOfActive = wizardState.indexOfActive;

    if (indexOfActive > 0) {
      this.goToStage(wizardManager, indexOfActive - 1, false);
    } else {
      this.router.navigate(wizardState.previousRoute);
    }
  }

  public submit(wizardManager: any, valid: boolean): void {
    // eslint-disable-next-line no-console
    console.log("submit", wizardManager, valid);
  }

  public async goToStage(wizardManager: any, index: number, blockIfInvalid: boolean): Promise<void> {

    const wizardState = this.getWizardState(wizardManager);

    const indexOfActive = wizardState.indexOfActive;

    wizardState.stages[indexOfActive].valid = await wizardState.stages[indexOfActive].validate?.();

    if (blockIfInvalid && !wizardState.stages[indexOfActive].valid) {
      this.eventAggregator.publish("handleValidationError", "Unable to proceed, please check the page for validation errors");
      return;
    }

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

  public registerValidationRules(wizardManager: any, data: object, rules: Rule<object, any>[][]) {
    const stage = this.getActiveStage(wizardManager);

    if (!stage.form) {
      stage.form = this.validationFactory.createForCurrentScope();
      stage.form.validateTrigger = validateTrigger.changeOrFocusout;
      stage.form.addRenderer(new PrimeRenderer);
      stage.validate = () => stage.form.validate().then(result => result.valid);
      stage.form.addObject(data, rules);
    }

    return stage.form;
  }

  // private getWizardStage(wizardManager: any, stageName: string): IWizardStage {
  //   return this.getWizardState(wizardManager).stages.find(stage => stage.name === stageName);
  // }

  private getActiveStage(wizardManager: any): IWizardStage {
    const wizardState = this.getWizardState(wizardManager);
    return wizardState.stages[wizardState.indexOfActive];
  }
}
