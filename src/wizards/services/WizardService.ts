import { IValidationController } from "@aurelia/validation-html";
import { IEventAggregator, inject } from "aurelia";
import { IRouter } from "@aurelia/router";
import { WizardManager } from "../tokenSwapDealWizard/wizardManager";
import { PrimeErrorPresenter } from "../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";

export interface IWizardState<Data = any> {
  stages: Array<IWizardStage>;
  indexOfActive: number;
  registrationData: Data;
  cancelRoute: string;
  previousRoute: string;
}

export type WizardErrors<Model> = Partial<Record<keyof Model, string>>;

export interface IWizardStage {
  name?: string;
  valid: boolean;
  route: string;
  hidden?: boolean;
  form?: IValidationController;
  validate?: () => Promise<boolean> | boolean;
}

export type WizardStateKey = WizardManager

@inject()
export class WizardService {
  private wizardsStates = new Map<WizardStateKey, IWizardState>();

  public currentWizard?: WizardManager;

  constructor(
    @IRouter private router: IRouter,
    @IEventAggregator private eventAggregator: IEventAggregator,
    private presenter: PrimeErrorPresenter,
  ) {
  }

  public registerWizard<TData>({
    wizardStateKey,
    stages,
    registrationData,
    cancelRoute,
    previousRoute,
  }: {
    wizardStateKey: WizardStateKey;
    stages: Array<IWizardStage>;
    registrationData: TData;
    cancelRoute: string;
    previousRoute: string;
  }): IWizardState<TData> {
    if (!this.hasWizard(wizardStateKey)) {
      this.wizardsStates.set(
        wizardStateKey,
        {
          stages,
          indexOfActive: 0,
          registrationData,
          cancelRoute,
          previousRoute,
        },
      );
    }

    return this.getWizardState(wizardStateKey);
  }

  public setActiveStage(wizardStateKey: WizardStateKey, indexOfActive: number): void {
    this.wizardsStates.get(wizardStateKey).indexOfActive = indexOfActive;
  }

  public getWizardState<Data>(wizardStateKey: WizardStateKey): IWizardState<Data> {
    return this.wizardsStates.get(wizardStateKey);
  }

  // public updateStageValidity(wizardStateKey: WizardStateKey, valid: boolean) {
  //   this.getActiveStage(wizardStateKey).valid = valid;
  // }

  public registerStageValidateFunction(
    wizardStateKey: WizardStateKey,
    validate: () => Promise<boolean>,
  ) {
    const stage = this.getActiveStage(wizardStateKey);
    stage.validate = validate;
  }

  public cancel(wizardStateKey: WizardStateKey): void {
    this.router.load(this.getWizardState(wizardStateKey).cancelRoute);
  }

  public async proceed(wizardStateKey: WizardStateKey): Promise<void> {
    const wizardState = this.getWizardState(wizardStateKey);
    const indexOfActive = wizardState.indexOfActive;

    return this.goToStage(wizardStateKey, indexOfActive + 1, true);
  }

  public previous(wizardStateKey: WizardStateKey): void {
    const wizardState = this.getWizardState(wizardStateKey);
    const indexOfActive = wizardState.indexOfActive;

    if (indexOfActive > 0) {
      this.goToStage(wizardStateKey, indexOfActive - 1, false);
    } else {
      this.router.load(wizardState.previousRoute);
    }
  }

  public async goToStage(wizardStateKey: WizardStateKey, destIndex: number, blockIfInvalid: boolean): Promise<void> {
    const wizardState = this.getWizardState(wizardStateKey);

    const currentIndexOfActive = wizardState.indexOfActive;
    /**
     * This will set valid state to undefined when the validate function is not uninitialized.
     * What is the use case for this?  When would validate ever be uninitialized? Should that be allowed?
     */
    const stage = wizardState.stages[currentIndexOfActive];
    stage.valid = await stage.validate?.();

    if (blockIfInvalid && !wizardState.stages[currentIndexOfActive].valid) {
      this.eventAggregator.publish("handleValidationError", "Unable to proceed, please check the page for validation errors");
      return;
    }

    /**
     * I suspect this only handles the case where we haven't finished coding all the stages.
     * Is it possible otherwise?
     */
    if (destIndex >= wizardState.stages.length) {
      return;
    }

    if (blockIfInvalid) {
      /**
       * if we are on the last stage and going to submit, make sure all *visible* stages are valid
       * (the Submit stage is not visible).
       */
      const visibleStages = wizardState.stages.filter(stage => !stage.hidden);
      const isLastStage = (visibleStages.length - 1) === currentIndexOfActive;
      if (isLastStage) {
        const allStagesAreValid = visibleStages.every(stage => stage.valid);

        if (!allStagesAreValid) {
          this.eventAggregator.publish("handleValidationError", "Unable to proceed, not all stages are valid");
          return;
        }
      }
    }

    // eslint-disable-next-line require-atomic-updates
    wizardState.indexOfActive = destIndex;

    // const params = {
    // ...this.router.currentInstruction.params,
    //   [STAGE_ROUTE_PARAMETER]: wizardState.stages[destIndex].route,
    // };

    this.router.load(wizardState.stages[destIndex].route, {
      origin: wizardStateKey,
      query: "",
      parameters: {
        settings: wizardStateKey.additionalStageMetadata,
      },
    });
    // this.router.currentInstruction.config.name,
    // `/initiate/token-swap/open-proposal/${wizardState.stages[destIndex].route}`,
    // );

    /**
     * restore validation feedbacks if they were previously computed.
     * This is experimental behavior. --dkent
     */
    // if (wizardState.stages[index].valid === false) { // deliberately false as opposed to undefined
    //   setTimeout(() => {
    //     wizardState.stages[index].validate?.();
    //   }, 0);
    // }
  }

  public hasWizard(wizardStateKey: WizardStateKey): boolean {
    return this.wizardsStates.has(wizardStateKey);
  }

  public registerForm(wizardStateKey: WizardStateKey, form: IValidationController) {
    const stage = this.getActiveStage(wizardStateKey);

    if (!stage.form) {
      stage.form = form;
      stage.form.addSubscriber(this.presenter);
      // stage.form.addSubscriber(new ValidationResultPresenterService());
      stage.validate = () => stage.form.validate().then(result => result.valid);
    }

    return stage.form;
  }

  // private getWizardStage(wizardStateKey: WizardStateKey, stageName: string): IWizardStage {
  //   return this.getWizardState(wizardStateKey).stages.find(stage => stage.name === stageName);
  // }

  private getActiveStage(wizardStateKey: WizardStateKey): IWizardStage {
    const wizardState = this.getWizardState(wizardStateKey);
    return wizardState.stages[wizardState.indexOfActive];
  }
}
