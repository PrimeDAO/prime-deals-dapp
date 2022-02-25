import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { STAGE_ROUTE_PARAMETER } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { Rule, validateTrigger, ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { PrimeRenderer } from "resources/elements/primeDesignSystem/validation/primeRenderer";
import { WizardManager } from "wizards/tokenSwapDealWizard/wizardManager";
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

@autoinject
export class WizardService {
  private wizardsStates = new Map<any, IWizardState>();

  constructor(
    private router: Router,
    private eventAggregator: EventAggregator,
    private validationFactory: ValidationControllerFactory,
    private alertService: AlertService,
  ) {
  }

  public registerWizard<TData>({
    wizardManager,
    stages,
    registrationData,
    cancelRoute,
    previousRoute,
  }: {
    wizardManager: WizardManager;
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

  public async submit(wizardManager: WizardManager): Promise<void> {
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

    this.deleteVotesForPartneredDeal(wizardManager);

    await this.alertService.showAlert(congratulatePopupModel);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private deleteVotesForPartneredDeal(wizardManager: WizardManager) {
    // eslint-disable-next-line no-console
    console.log("TODO: deleteVotesForPartneredDeal");
  }
}
