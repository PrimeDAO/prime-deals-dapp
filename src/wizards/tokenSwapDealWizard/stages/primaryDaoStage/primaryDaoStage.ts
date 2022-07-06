import { IDAO, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { daoStageValidationRules, IStageMeta, WizardType } from "../../dealWizardTypes";
import { IValidationRules } from "@aurelia/validation";
import { IDisposable, IEventAggregator, inject } from "aurelia";

export class PrimaryDaoStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private disabled: boolean;
  private isPartneredDeal: boolean;
  private primaryDao: IDAO;
  private event: IDisposable;

  constructor(
    @inject("registrationData") private readonly registrationData: IDealRegistrationTokenSwap,
    @IEventAggregator private readonly eventAggregator: IEventAggregator,
    @IValidationRules private validationRules: IValidationRules,
  ) {
  }

  load(stageMeta: IStageMeta): void {
    this.disabled = stageMeta.wizardType === WizardType.makeAnOffer;
    this.isPartneredDeal = this.getIsPartneredDeal(stageMeta.wizardType);
    this.primaryDao = this.registrationData?.primaryDAO;
    const partnerDao = this.isPartneredDeal ? this.wizardState.registrationData.partnerDAO : null;
    daoStageValidationRules(this.primaryDao, this.validationRules, "Primary DAO", partnerDao);

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
