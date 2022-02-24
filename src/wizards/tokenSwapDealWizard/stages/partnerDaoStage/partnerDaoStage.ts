import { autoinject } from "aurelia-framework";
import { ValidationController } from "aurelia-validation";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { daoStageValidationRules, IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";

@autoinject
export class PartnerDaoStage implements IBaseWizardStage {
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
    this.isPartneredDeal = this.getIsPartneredDeal(stageMeta.wizardType);

    const validationRules = daoStageValidationRules("Partner DAO");

    this.form = this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData.partnerDAO,
      validationRules,
    );
  }

  getIsPartneredDeal(wizardType: WizardType) {
    switch (wizardType) {
      case WizardType.partneredDeal:
      case WizardType.makeAnOffer:
      case WizardType.partneredDealEdit:
        return true;

      default:
        return false;
    }
  }
}
