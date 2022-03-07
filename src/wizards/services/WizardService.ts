import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { STAGE_ROUTE_PARAMETER } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { Rule, validateTrigger, ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { PrimeRenderer } from "resources/elements/primeDesignSystem/validation/primeRenderer";
import { AlertService, IAlertModel } from "services/AlertService";

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

export type WizardStateKey = unknown

@autoinject
export class WizardService {
  private wizardsStates = new Map<WizardStateKey, IWizardState>();

  constructor(
    private router: Router,
    private eventAggregator: EventAggregator,
    private validationFactory: ValidationControllerFactory,
    private alertService: AlertService,
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
    this.router.navigate(this.getWizardState(wizardStateKey).cancelRoute);
  }

  public async proceed(wizardStateKey: WizardStateKey): Promise<void> {
    const wizardState = this.getWizardState(wizardStateKey);
    const indexOfActive = wizardState.indexOfActive;

    this.goToStage(wizardStateKey, indexOfActive + 1, true);
  }

  public previous(wizardStateKey: WizardStateKey): void {
    const wizardState = this.getWizardState(wizardStateKey);
    const indexOfActive = wizardState.indexOfActive;

    if (indexOfActive > 0) {
      this.goToStage(wizardStateKey, indexOfActive - 1, false);
    } else {
      this.router.navigate(wizardState.previousRoute);
    }
  }

  public async submit(wizardStateKey: WizardStateKey): Promise<void> {
    let allStagesValid = false;
    this.wizardsStates.forEach((wizardState) => {
      allStagesValid = wizardState.stages.every(stage => stage.valid);
    });

    if (!allStagesValid) return;

    const congratulatePopupModel: IAlertModel = {
      header: "Your deal has been submitted!",
      message: "<p class='excitement'>Share your new deal proposal with your community!</p><p class='tweetlink'><a href='https://twitter.com' target='_blank' rel='noopener noreferrer'>TWEET <i class='fab fa-twitter'></i></a></p>",
      confetti: true,
      buttonTextPrimary: "Go to deal (todo)",
      className: "congratulatePopup",
    };

    this.deleteVotesForPartneredDeal(wizardStateKey);

    await this.alertService.showAlert(congratulatePopupModel);
  }

  public async goToStage(wizardStateKey: WizardStateKey, index: number, blockIfInvalid: boolean): Promise<void> {

    const wizardState = this.getWizardState(wizardStateKey);

    const currentIndexOfActive = wizardState.indexOfActive;
    /**
     * This will set valid state to undefined when the validate function is not uninitialized.
     * What is the use case for this?  When would validate ever be uninitialized? Should that be allowed?
     */
    // eslint-disable-next-line require-atomic-updates
    wizardState.stages[currentIndexOfActive].valid = await wizardState.stages[currentIndexOfActive].validate?.();

    if (blockIfInvalid && !wizardState.stages[currentIndexOfActive].valid) {
      this.eventAggregator.publish("handleValidationError", "Unable to proceed, please check the page for validation errors");
      return;
    }

    if (index >= wizardState.stages.length) {
      return;
    }

    // eslint-disable-next-line require-atomic-updates
    wizardState.indexOfActive = index;

    const params = {
      ...this.router.currentInstruction.params,
      [STAGE_ROUTE_PARAMETER]: wizardState.stages[index].route,
    };

    this.router.navigateToRoute(
      this.router.currentInstruction.config.name,
      params,
    );
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

  public registerValidationRules(wizardStateKey: WizardStateKey, data: object, rules: Rule<object, any>[][]) {
    const stage = this.getActiveStage(wizardStateKey);

    if (!stage.form) {
      stage.form = this.validationFactory.createForCurrentScope();
      stage.form.validateTrigger = validateTrigger.changeOrFocusout;
      stage.form.addRenderer(new PrimeRenderer);
      stage.validate = () => stage.form.validate().then(result => result.valid);
      stage.form.addObject(data, rules);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private deleteVotesForPartneredDeal(wizardStateKey: WizardStateKey) {
    // eslint-disable-next-line no-console
    console.log("TODO: deleteVotesForPartneredDeal");
  }
}
