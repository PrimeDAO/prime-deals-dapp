import { IDAO, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { daoStageValidationRules, IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";
import { IValidationRules } from "@aurelia/validation";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationController } from "@aurelia/validation-html";

@processContent(autoSlot)
export class PartnerDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private disabled: boolean;
  private isPartneredDeal: boolean;
  private partnerDao: IDAO;

  constructor(
    public wizardService: WizardService,
    @newInstanceForScope(IValidationController) public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
  ) {
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
