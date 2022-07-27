import { IDAO, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState } from "wizards/services/WizardService";
import { daoStageValidationRules, IStageMeta, WizardType } from "../../dealWizardTypes";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";
import { IValidationRules } from "@aurelia/validation";
import { newInstanceOf } from "@aurelia/kernel";
import { IValidationController } from "@aurelia/validation-html";
import { inject } from "aurelia";

@processContent(autoSlot)
export class PartnerDaoStage {
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private disabled: boolean;
  private isPartneredDeal: boolean;
  private readonly partnerDao: IDAO;

  constructor(
    @inject("registrationData") private readonly registrationData: IDealRegistrationTokenSwap,
    @newInstanceOf(IValidationController) public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
  ) {
    this.partnerDao = this.registrationData.primaryDAO;
    daoStageValidationRules(this.partnerDao, this.validationRules, "Partner DAO", this.registrationData.primaryDAO);
  }

  load(stageMeta: IStageMeta): void {
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
