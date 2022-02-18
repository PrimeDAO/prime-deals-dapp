import { autoinject } from "aurelia-framework";
import { ValidationController } from "aurelia-validation";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { daoStageValidationRules, IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";

@autoinject
export class PrimaryDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private disabled: boolean;
  private form: ValidationController;

  constructor(
    public wizardService: WizardService,
  ) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.disabled = stageMeta.wizardType === WizardType.makeAnOffer;

    const validationRules = daoStageValidationRules("Primary DAO");

    this.form = this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData.primaryDAO,
      validationRules,
    );
  }
}
