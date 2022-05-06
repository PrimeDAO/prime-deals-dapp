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
  private isPartneredDeal: boolean;

  constructor(
    public wizardService: WizardService,
  ) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.disabled = stageMeta.wizardType === WizardType.makeAnOffer;
    this.isPartneredDeal = this.getIsPartneredDeal(stageMeta.wizardType);

    const partnerDao = this.isPartneredDeal ? this.wizardState.registrationData.partnerDAO : null;

    const validationRules = daoStageValidationRules("Primary DAO", partnerDao);

    this.form = this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData.primaryDAO,
      validationRules,
    );
  }

  getIsPartneredDeal(wizardType: WizardType) {
    switch (wizardType) {
      case WizardType.createPartneredDeal:
      case WizardType.makeAnOffer:
      case WizardType.editPartneredDeal:
        return true;

      default:
        return false;
    }
  }
}
