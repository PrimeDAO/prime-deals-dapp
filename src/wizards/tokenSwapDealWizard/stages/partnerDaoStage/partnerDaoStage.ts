import { IDAO, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { IWizardState, WizardService } from "wizards/services/WizardService";
import { daoStageValidationRules, IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";
import { IValidationRules } from "@aurelia/validation";

@processContent(autoSlot)
export class PartnerDaoStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private disabled: boolean;
  private isPartneredDeal: boolean;
  private partnerDao: IDAO;

  constructor(
    public wizardService: WizardService,
    @IValidationRules private validationRules: IValidationRules,
  ) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.isPartneredDeal = this.getIsPartneredDeal(stageMeta.wizardType);

    this.partnerDao = this.wizardState.registrationData.primaryDAO;
    daoStageValidationRules(this.partnerDao, this.validationRules, "Partner DAO", this.wizardState.registrationData.primaryDAO);

    // this.form = this.wizardService.registerValidationRules( // TODO add this back?
    //   this.wizardManager,
    //   this.wizardState.registrationData.partnerDAO,
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
