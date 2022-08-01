import { IDAO, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState } from "wizards/services/WizardService";
import { daoStageValidationRules, IStageMeta, WizardType } from "../../dealWizardTypes";
import { IValidationRules } from "@aurelia/validation";
import { IDisposable, IEventAggregator, inject } from "aurelia";

export class PrimaryDaoStage {
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private disabled: boolean;
  private isPartneredDeal: boolean;
  private readonly primaryDao: IDAO;
  private event: IDisposable;

  constructor(
    @inject("registrationData") private readonly registrationData: IDealRegistrationTokenSwap,
    @IEventAggregator private readonly eventAggregator: IEventAggregator,
    @IValidationRules private validationRules: IValidationRules,
  ) {
    const partnerDao = this.isPartneredDeal ? registrationData.partnerDAO : null;
    this.primaryDao = this.registrationData?.primaryDAO;
    daoStageValidationRules(this.primaryDao, this.validationRules, "Primary DAO", partnerDao);
  }

  load(stageMeta: IStageMeta): void {
    this.disabled = stageMeta.wizardType === WizardType.makeAnOffer;
    this.isPartneredDeal = this.getIsPartneredDeal(stageMeta.wizardType);
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
