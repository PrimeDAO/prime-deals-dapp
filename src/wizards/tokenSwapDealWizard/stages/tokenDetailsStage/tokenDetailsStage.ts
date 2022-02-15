import { autoinject, computedFrom } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IStageMeta, WizardType } from "../../dealWizardTypes";
import "./tokenDetailsStage.scss";
import { IDealRegistrationTokenSwap, IToken } from "../../../../entities/DealRegistrationTokenSwap";

@autoinject
export class TokenDetailsStage {
  wizardManager: any;
  wizardState: IWizardState<IDealRegistrationTokenSwap>;
  isOpenDealWizard = false;
  form: ValidationController;

  tokenDetailsForms: ValidationController[] = [];

  constructor(
    public wizardService: WizardService,
  ) {
  }

  @computedFrom("isOpenDealWizard", "wizardState.registrationData.primaryDAO.tokens.length")
  get hasValidTokensDetailsCount() {
    return !this.isOpenDealWizard ? Boolean(this.wizardState.registrationData.primaryDAO.tokens.length) : true;
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.isOpenDealWizard = [WizardType.openProposal, WizardType.openProposalEdit].includes(stageMeta.wizardType);

    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    const validationRules = ValidationRules
      .ensure<IDealRegistrationTokenSwap, number>(data => data.executionPeriodInDays)
      .required()
      .withMessage("Execution period is required")
      .rules;

    this.form = this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData,
      validationRules,
    );

    this.wizardService.registerStageValidateFunction(this.wizardManager, async () => {

      const tokenDetailsValidationResults = await Promise.all(
        this.tokenDetailsForms.map(form => form.validate().then(result => result.valid)),
      );

      return this.form.validate()
        .then(result =>
          result.valid &&
          this.hasValidTokensDetailsCount &&
          Boolean(tokenDetailsValidationResults.filter(Boolean).length),
        );
    });
  }

  addToken() {
    this.wizardState.registrationData.primaryDAO.tokens.push({
      address: "",
      amount: undefined,
      instantTransfer: 0,
      vestedTransfer: 0,
      vestedFor: undefined,
      cliffOf: undefined,
    });
  }

  deleteToken(token: IToken) {
    const index = this.wizardState.registrationData.primaryDAO.tokens.indexOf(token);
    if (index !== -1) {
      this.tokenDetailsForms.splice(index, 1);
      this.wizardState.registrationData.primaryDAO.tokens.splice(index, 1);
    }
  }
}
