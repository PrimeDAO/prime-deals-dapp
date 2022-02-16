import { autoinject } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { IDealRegistrationTokenSwap, IDAO, ISocialMedia } from "entities/DealRegistrationTokenSwap";
import { Validation } from "services/ValidationService";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";

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

    const validationRules = ValidationRules
      .ensure<IDAO, string>(dao => dao.name)
      .required()
      .withMessage("Primary DAO name is required")
      .ensure<string>(dao => dao.treasury_address)
      .required()
      .withMessage("Treasury address is required")
      .satisfiesRule(Validation.isETHAddress)
      .ensure<string>(dao => dao.logo_url)
      .required()
      .withMessage("Primary DAO avatar is required")
      .satisfiesRule(Validation.imageUrl)
      .ensure<ISocialMedia[]>(dao => dao.social_medias)
      .required()
      .satisfiesRule(Validation.uniqueCollection)
      .maxItems(5)
      .ensure<{address: string}[]>(dao => dao.representatives)
      .required()
      .satisfiesRule(Validation.uniqueCollection)
      .minItems(1)
      .maxItems(5)
      .rules;

    this.form = this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData.primaryDAO,
      validationRules,
    );
  }
}
