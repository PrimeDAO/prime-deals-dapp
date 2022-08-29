import { BrowserStorageService } from './../../../../services/BrowserStorageService';
import { IStageMeta, WizardType } from "../../dealWizardTypes";
import "./tokenDetailsStage.scss";
import { IDAO, IDealRegistrationTokenSwap, IToken } from "../../../../entities/DealRegistrationTokenSwap";
import { TokenDetails } from "../../components/tokenDetails/tokenDetails";
import { ViewMode } from "../../../../resources/elements/editingCard/editingCard";
import { TokenService } from "services/TokenService";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";
import { IValidationRules } from "@aurelia/validation";
import { IValidationController } from "@aurelia/validation-html";
import { inject } from "aurelia";
import { areFormsValid } from "../../../../services/ValidationService";

interface IDAOData {
      name: string,
      avatarUrl?: string,
      tokenAddresses: string[],
      treasuryAddresses?: string[],
}

interface IDAOsData {
  date: Date,
  data: {
    id: IDAOData,
  }
}

type TokenDetailsMetadata = Record<"primaryDAOTokenDetailsViewModes" | "partnerDAOTokenDetailsViewModes", ViewMode[]>;

@processContent(autoSlot)
export class TokenDetailsStage {
  wizardType: WizardType;
  isOpenProposalWizard = false;

  primaryDAOTokenDetails: (TokenDetails | null)[] = [];
  partnerDAOTokenDetails: (TokenDetails | null)[] = [];
  stageMetadata: Partial<TokenDetailsMetadata> = {};

  hasUnsavedChangesForPrimaryDetails = false;
  hasUnsavedChangesForPartnerDetails = false;

  primaryDaoTokens: IToken[];
  partnerDaoTokens: IToken[];
  daosFromStorage: IDAOsData;

  constructor(
    @inject("registrationData") private readonly registrationData: IDealRegistrationTokenSwap,
    @inject("wizardSettings.token-details") private readonly stageSettings: TokenDetailsMetadata,
    @IValidationController public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
    private browserStorageService: BrowserStorageService,
  ) {
  }

  get hasValidPrimaryDAOTokensDetailsCount(): boolean {
    return !this.isOpenProposalWizard ? Boolean(this.registrationData.primaryDAO.tokens.length) : true;
  }

  get hasValidPartnerDAOTokensDetailsCount(): boolean {
    return !this.isOpenProposalWizard ? Boolean(this.registrationData.partnerDAO?.tokens.length) : true;
  }

  get primaryDaoTokenOptions(): string[] {
    if (!this.registrationData.primaryDAO.deepDAOId) return [];
    const primaryDaoData: IDAOData = this.daosFromStorage.data[this.registrationData.primaryDAO.deepDAOId] || [];
    return primaryDaoData?.tokenAddresses || [];
  }

  get partnerDaoTokenOptions(): string[] {
    if (!this.registrationData.partnerDAO.deepDAOId) return [];
    const partnerDaoData: IDAOData = this.daosFromStorage.data[this.registrationData.partnerDAO.deepDAOId] || [];
    return partnerDaoData?.tokenAddresses || [];
  }


  load(stageMeta: IStageMeta<TokenDetailsMetadata>): void {

    this.wizardType = stageMeta.wizardType;
    this.isOpenProposalWizard = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);

    this.addDefaultValuesToRegistrationData(stageMeta.wizardType);

    this.stageSettings.primaryDAOTokenDetailsViewModes = this.stageSettings.primaryDAOTokenDetailsViewModes
      ?? this.getDefaultTokenDetailsViewModes(stageMeta.wizardType, this.registrationData.primaryDAO);
    this.stageSettings.partnerDAOTokenDetailsViewModes = this.stageSettings.partnerDAOTokenDetailsViewModes
      ?? this.getDefaultTokenDetailsViewModes(stageMeta.wizardType, this.registrationData.partnerDAO);

    this.daosFromStorage = this.browserStorageService.lsGet("daosData");

    this.primaryDaoTokens = this.registrationData.primaryDAO.tokens;
    if (this.primaryDaoTokenOptions?.length === 1) {
      if (!this.primaryDaoTokens[0]) {
        this.addToken(this.primaryDaoTokens);
      }
      if (!this.primaryDaoTokens[0].address) {
        this.primaryDaoTokens[0].address = this.primaryDaoTokenOptions[0];
      }
    }

    this.validationRules
      .on(this.registrationData)
      .ensure("fundingPeriod")
      .required()
      .when(() => !this.isOpenProposalWizard)
      .withMessage("Funding Period is required")
      .min(0)
      .withMessage("Funding Period should be greater or equal to zero");

    this.validationRules
      .on(this.primaryDaoTokens)
      .ensureObject()
      .satisfies(async () => {
        const forms = this.primaryDAOTokenDetails.filter(Boolean).map(viewModel => viewModel.form);
        const areTokensValid = await areFormsValid(forms);

        this.checkedForUnsavedChangesForPrimaryDao();

        return this.hasValidPrimaryDAOTokensDetailsCount &&
          !this.hasUnsavedChangesForPrimaryDetails &&
          areTokensValid;
      });
    this.form.addObject(this.primaryDaoTokens);

    if (!this.isOpenProposalWizard) {
      this.registrationData.partnerDAO.tokens = this.registrationData.partnerDAO?.tokens ?? [];

      this.partnerDaoTokens = this.registrationData.partnerDAO.tokens;
      if (this.partnerDaoTokenOptions?.length === 1 && !this.partnerDaoTokens[0].address) {
        this.partnerDaoTokens[0].address = this.partnerDaoTokenOptions[0];
      }

      this.validationRules
        .on(this.partnerDaoTokens)
        .ensureObject()
        .satisfies(async () => {
          const forms = this.partnerDAOTokenDetails.filter(Boolean).map(viewModel => viewModel.form);
          const areTokensValid = await areFormsValid(forms);

          this.checkedForUnsavedChangesForPartnerDao();

          return !this.hasUnsavedChangesForPartnerDetails &&
            this.hasValidPartnerDAOTokensDetailsCount &&
            areTokensValid;
        });

      this.form.addObject(this.partnerDaoTokens);
    }
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
      decimals: TokenService.DefaultDecimals,
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
    this.checkedForUnsavedChangesForPrimaryDao();
    this.checkedForUnsavedChangesForPartnerDao();
  }

  private checkedForUnsavedChangesForPrimaryDao() {
    this.hasUnsavedChangesForPrimaryDetails = this.primaryDAOTokenDetails.filter(viewModel => viewModel?.viewMode === "edit").length > 0;
  }

  private checkedForUnsavedChangesForPartnerDao() {
    this.hasUnsavedChangesForPartnerDetails = this.partnerDAOTokenDetails.filter(viewModel => viewModel?.viewMode === "edit").length > 0;
  }

  private addDefaultValuesToRegistrationData(wizardType: WizardType) {
    if (this.isCreatingPartneredDealLike(wizardType)) {
      if (this.registrationData.primaryDAO.tokens.length === 0) {
        this.addToken(this.registrationData.primaryDAO.tokens);
      }
      if (this.registrationData.partnerDAO.tokens.length === 0) {
        this.addToken(this.registrationData.partnerDAO.tokens);
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
