import { autoinject, computedFrom } from "aurelia-framework";
import { ValidationController, ValidationRules } from "aurelia-validation";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IStageMeta, WizardType } from "../../dealWizardTypes";
import "./tokenDetailsStage.scss";
import { IDAO, IDealRegistrationTokenSwap, IToken } from "../../../../entities/DealRegistrationTokenSwap";
import { areFormsValid } from "../../../../services/ValidationService";
import { TokenDetails } from "../../components/tokenDetails/tokenDetails";
import { ViewMode } from "../../../../resources/elements/editingCard/editingCard";

type TokenDetailsMetadata = Record<"primaryDAOTokenDetailsViewModes" | "partnerDAOTokenDetailsViewModes", ViewMode[]>;

@autoinject
export class TokenDetailsStage {
  wizardManager: any;
  wizardState: IWizardState<IDealRegistrationTokenSwap>;
  wizardType: WizardType;
  isOpenProposalWizard = false;
  form: ValidationController;

  primaryDAOTokenDetails: TokenDetails[] = [];
  partnerDAOTokenDetails: TokenDetails[] = [];
  stageMetadata: Partial<TokenDetailsMetadata> = {};

  hasUnsavedChangesForPrimaryDetails = false;
  hasUnsavedChangesForPartnerDetails = false;

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

    this.wizardType = stageMeta.wizardType;
    this.isOpenProposalWizard = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);

    this.addDefaultValuesToRegistrationData(stageMeta.wizardType);

    this.stageMetadata.primaryDAOTokenDetailsViewModes = this.stageMetadata.primaryDAOTokenDetailsViewModes
      ?? this.getDefaultTokenDetailsViewModes(stageMeta.wizardType, this.wizardState.registrationData.primaryDAO);
    this.stageMetadata.partnerDAOTokenDetailsViewModes = this.stageMetadata.partnerDAOTokenDetailsViewModes
      ?? this.getDefaultTokenDetailsViewModes(stageMeta.wizardType, this.wizardState.registrationData.partnerDAO);

    const validationRules = ValidationRules
      .ensure<IDealRegistrationTokenSwap, number>(data => data.executionPeriodInDays)
      .required()
      .when(() => !this.isOpenProposalWizard)
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
      const primaryTokensForms = this.primaryDAOTokenDetails.map(viewModel => viewModel.form);
      const partnerTokensForms = this.partnerDAOTokenDetails.map(viewModel => viewModel.form);
      const primaryTokensValid = await areFormsValid(primaryTokensForms);
      const partnerTokensValid = await areFormsValid(partnerTokensForms);

      this.checkedForUnsavedChanges();

      return this.form.validate()
        .then(async (result) => result.valid &&
          this.hasValidPrimaryDAOTokensDetailsCount &&
          !this.hasUnsavedChangesForPrimaryDetails &&
          !this.hasUnsavedChangesForPartnerDetails &&
          this.hasValidPartnerDAOTokensDetailsCount &&
          primaryTokensValid &&
          (this.isOpenProposalWizard ? true : partnerTokensValid),
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

  deleteToken(index: number, tokens: IToken[], forms: TokenDetails[], tokensViewModes: ViewMode[]): void {
    forms.splice(index, 1);
    tokens.splice(index, 1);
    tokensViewModes.splice(index, 1);
    this.checkedForUnsavedChanges();
  }

  private getDefaultTokenDetailsViewModes(wizardType: WizardType, dao?: IDAO): ("view" | "edit")[] {
    return this.isCreatingDealLike(wizardType)
      ? []
      : dao?.tokens?.map(() => "view") ?? [];
  }

  private checkedForUnsavedChanges() {
    this.hasUnsavedChangesForPrimaryDetails = this.primaryDAOTokenDetails.filter(viewModel => viewModel.viewMode === "edit").length > 0;
    this.hasUnsavedChangesForPartnerDetails = this.partnerDAOTokenDetails.filter(viewModel => viewModel.viewMode === "edit").length > 0;
  }

  private addDefaultValuesToRegistrationData(wizardType: WizardType) {
    if (this.isCreatingPartneredDealLike(wizardType)) {
      if (this.wizardState.registrationData.primaryDAO.tokens.length === 0) {
        this.addToken(this.wizardState.registrationData.primaryDAO.tokens);
      }
      if (this.wizardState.registrationData.partnerDAO.tokens.length === 0) {
        this.addToken(this.wizardState.registrationData.partnerDAO.tokens);
      }
    }
  }

  private isCreatingPartneredDealLike(wizardType: WizardType): boolean {
    return [WizardType.createPartneredDeal, WizardType.makeAnOffer, WizardType.editPartneredDeal].includes(wizardType);
  }

  private isCreatingDealLike(wizardType: WizardType): boolean {
    return [
      WizardType.createOpenProposal,
      WizardType.createPartneredDeal,
      WizardType.makeAnOffer,
    ].includes(wizardType);
  }
}
