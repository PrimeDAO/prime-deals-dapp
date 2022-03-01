import { autoinject, computedFrom } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IStageMeta, WizardType } from "../../dealWizardTypes";
import "./tokenDetailsStage.scss";
import { IDAO, IDealRegistrationTokenSwap, IToken } from "../../../../entities/DealRegistrationTokenSwap";

type TokenDetailsMetadata = Record<"primaryDAOTokenDetailsViewModes" | "partnerDAOTokenDetailsViewModes", ("edit" | "view")[]>;

@autoinject
export class TokenDetailsStage {
  wizardManager: any;
  wizardState: IWizardState<IDealRegistrationTokenSwap>;
  isOpenProposalWizard = false;
  form: ValidationController;

  primaryDAOTokensForms: ValidationController[] = [];
  partnerDAOTokensForms: ValidationController[] = [];
  stageMetadata: Partial<TokenDetailsMetadata> = {};

  constructor(
    private wizardService: WizardService,
  ) {
  }

  @computedFrom("isOpenProposalWizard", "wizardState.registrationData.primaryDAO.tokens.length")
  get hasValidPrimaryDAOTokensDetailsCount(): boolean {
    return !this.isOpenProposalWizard ? Boolean(this.wizardState.registrationData.primaryDAO.tokens.length) : true;
  }

  @computedFrom("isOpenProposalWizard", "wizardState.registrationData.partnerDAO.tokens.length")
  get hasValidPartnerDAOTokensDetailsCount(): boolean {
    return !this.isOpenProposalWizard ? Boolean(this.wizardState.registrationData.partnerDAO.tokens.length) : true;
  }

  activate(stageMeta: IStageMeta<TokenDetailsMetadata>): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.stageMetadata = stageMeta.settings;

    this.isOpenProposalWizard = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);

    this.stageMetadata.primaryDAOTokenDetailsViewModes = this.stageMetadata.primaryDAOTokenDetailsViewModes
      ?? this.getDefaultTokenDetailsViewModes(stageMeta.wizardType, this.wizardState.registrationData.primaryDAO);
    this.stageMetadata.partnerDAOTokenDetailsViewModes = this.stageMetadata.partnerDAOTokenDetailsViewModes
      ?? this.getDefaultTokenDetailsViewModes(stageMeta.wizardType, this.wizardState.registrationData.partnerDAO);

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

      // check if child components for primary token details are valid
      const primaryDAOTokenValidation = await Promise.all(
        this.primaryDAOTokensForms.map(form => form.validate().then(result => result.valid)),
      );

      // check if child components for partner token details are valid
      const partnerDAOTokenValidation = await Promise.all(
        this.partnerDAOTokensForms.map(form => form.validate().then(result => result.valid)),
      );

      return this.form.validate()
        .then(result => result.valid &&
          this.hasValidPrimaryDAOTokensDetailsCount &&
          this.hasValidPrimaryDAOTokensDetailsCount &&
          !!primaryDAOTokenValidation.filter(Boolean).length &&
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

  private getDefaultTokenDetailsViewModes(wizardType: WizardType, dao?: IDAO): ("view" | "edit")[] {
    return [WizardType.createOpenProposal, WizardType.createPartneredDeal].includes(wizardType)
      ? []
      : dao?.tokens?.map(() => "view") ?? [];
  }
}
