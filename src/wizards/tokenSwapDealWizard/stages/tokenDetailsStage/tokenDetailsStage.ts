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
  isOpenProposalWizard = false;
  form: ValidationController;

  primaryDAOTokensForms: ValidationController[] = [];
  partnerDAOTokensForms: ValidationController[] = [];

  constructor(
    private wizardService: WizardService,
  ) {
  }

  @computedFrom("isOpenProposalWizard", "wizardState.registrationData.primaryDAO.tokens.length")
  get hasValidTokensDetailsCount(): boolean {
    return !this.isOpenProposalWizard ? Boolean(this.wizardState.registrationData.primaryDAO.tokens.length) : true;
  }

  hasValidTokensDetailsCount2(tokens: IToken[]): boolean {
    return !this.isOpenProposalWizard ? Boolean(tokens.length) : true;
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.isOpenProposalWizard = [WizardType.createOpenProposal, WizardType.openProposalEdit].includes(stageMeta.wizardType);

    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    const validationRules = ValidationRules
      .ensure<IDealRegistrationTokenSwap, number>(data => data.executionPeriodInDays)
      .required()
      .withMessage("Execution period is required")
      .min(0)
      .withMessage("Execution period should be greater or equal to zero")
      .rules;

    this.form = this.wizardService.registerValidationRules(
      this.wizardManager,
      this.wizardState.registrationData,
      validationRules,
    );

    this.wizardService.registerStageValidateFunction(this.wizardManager, async () => {
      const primaryDAOTokenValidation = await Promise.all(
        this.primaryDAOTokensForms.map(form => form.validate().then(result => result.valid)),
      );
      const partnerDAOTokenValidation = await Promise.all(
        this.partnerDAOTokensForms.map(form => form.validate().then(result => result.valid)),
      );

      return this.form.validate()
        .then(result => result.valid &&
          this.hasValidTokensDetailsCount &&
          Boolean(primaryDAOTokenValidation.filter(Boolean).length) &&
          (this.isOpenProposalWizard ? true : Boolean(partnerDAOTokenValidation.filter(Boolean).length)),
        );
    });
  }

  addToken(tokens: IToken[]): void {
    tokens.push({
      address: "",
      amount: "",
      instantTransferAmount: "",
      vestedTransferAmount: "",
      vestedFor: 0,
      cliffOf: 0,

      name: "",
      symbol: "",
      decimals: 18,
      logoURI: "",
    });
  }

  deleteToken(token: IToken, tokens: IToken[], forms: ValidationController[]): void {
    const index = tokens.indexOf(token);
    if (index !== -1) {
      forms.splice(index, 1);
      tokens.splice(index, 1);
    }
  }
}
