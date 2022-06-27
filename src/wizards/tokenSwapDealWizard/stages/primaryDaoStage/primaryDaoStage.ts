import { inject } from "aurelia";

@inject()
export class PrimaryDaoStage {
  // public wizardManager: any;
  // public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  // private disabled: boolean;
  // private isPartneredDeal: boolean;
  // private primaryDao: IDAO;
  //
  // constructor(
  //   public wizardService: WizardService,
  //   @newInstanceForScope(IValidationController) public form: IValidationController,
  //   @IValidationRules private validationRules: IValidationRules,
  // ) {
  // }

  // load(stageMeta: IStageMeta): void {
  //   this.wizardManager = this.wizardService.currentWizard;
  //   this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  //   this.disabled = stageMeta.wizardType === WizardType.makeAnOffer;
  //   this.isPartneredDeal = this.getIsPartneredDeal(stageMeta.wizardType);
  //
  //   this.primaryDao = this.wizardState.registrationData.primaryDAO;
  //   const partnerDao = this.isPartneredDeal ? this.wizardState.registrationData.partnerDAO : null;
  //
  //   daoStageValidationRules(this.primaryDao, this.validationRules, "Primary DAO", partnerDao);
  //
  //   this.wizardService.registerForm(this.wizardManager, this.form);
  // }

  // getIsPartneredDeal(wizardType: WizardType) {
  //   switch (wizardType) {
  //     case WizardType.createPartneredDeal:
  //     case WizardType.makeAnOffer:
  //     case WizardType.editPartneredDeal:
  //       return true;
  //
  //     default:
  //       return false;
  //   }
  // }
}
