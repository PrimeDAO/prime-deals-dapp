import { IDAO, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { daoStageValidationRules, IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";
import { IValidationRules } from "@aurelia/validation";

@processContent(autoSlot)
export class PrimaryDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private disabled: boolean;
  private isPartneredDeal: boolean;
  private primaryDao: IDAO;

  constructor(
    public wizardService: WizardService,
    @IValidationRules private validationRules: IValidationRules,
  ) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.disabled = stageMeta.wizardType === WizardType.makeAnOffer;
    this.isPartneredDeal = this.getIsPartneredDeal(stageMeta.wizardType);

    this.primaryDao = this.wizardState.registrationData.primaryDAO;
    const partnerDao = this.isPartneredDeal ? this.wizardState.registrationData.partnerDAO : null;

    daoStageValidationRules(this.primaryDao, this.validationRules, "Primary DAO", partnerDao);

    // this.form = this.wizardService.registerValidationRules(
    //   this.wizardManager,
    //   this.wizardState.registrationData.primaryDAO,
    //   validationRules,
    // );
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
