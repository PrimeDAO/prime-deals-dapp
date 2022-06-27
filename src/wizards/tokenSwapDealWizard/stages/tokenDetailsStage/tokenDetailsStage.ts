import { IWizardState, WizardService } from "../../../services/WizardService";
import { WizardType } from "../../dealWizardTypes";
import "./tokenDetailsStage.scss";
import { IDAO, IDealRegistrationTokenSwap, IToken } from "../../../../entities/DealRegistrationTokenSwap";
import { TokenDetails } from "../../components/tokenDetails/tokenDetails";
import { ViewMode } from "../../../../resources/elements/editingCard/editingCard";
import { TokenService } from "services/TokenService";
import { IValidationRules } from "@aurelia/validation";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationController } from "@aurelia/validation-html";
import { inject } from "aurelia";

type TokenDetailsMetadata = Record<"primaryDAOTokenDetailsViewModes" | "partnerDAOTokenDetailsViewModes", ViewMode[]>;

@inject()
export class TokenDetailsStage {
  wizardManager: any;
  wizardState: IWizardState<IDealRegistrationTokenSwap>;
  wizardType: WizardType;
  isOpenProposalWizard = false;

  primaryDAOTokenDetails: TokenDetails[] = [];
  partnerDAOTokenDetails: TokenDetails[] = [];
  stageMetadata: Partial<TokenDetailsMetadata> = {};

  hasUnsavedChangesForPrimaryDetails = false;
  hasUnsavedChangesForPartnerDetails = false;
  registrationData: IDealRegistrationTokenSwap;

  constructor(
    private wizardService: WizardService,
    @newInstanceForScope(IValidationController) private form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
  ) {
  }

  get hasValidPrimaryDAOTokensDetailsCount(): boolean {
    return !this.isOpenProposalWizard ? Boolean(this.wizardState.registrationData.primaryDAO.tokens.length) : true;
  }

  get hasValidPartnerDAOTokensDetailsCount(): boolean {
    return !this.isOpenProposalWizard ? Boolean(this.wizardState.registrationData.partnerDAO?.tokens.length) : true;
  }

  // load(stageMeta: IStageMeta<TokenDetailsMetadata>): void {
  //   this.wizardManager = this.wizardService.currentWizard;
  //   this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  //   this.stageMetadata = stageMeta.settings ?? {};
  //
  //   this.wizardType = stageMeta.wizardType;
  //   this.isOpenProposalWizard = [WizardType.createOpenProposal, WizardType.editOpenProposal].includes(stageMeta.wizardType);
  //
  //   this.addDefaultValuesToRegistrationData(stageMeta.wizardType);
  //
  //   this.stageMetadata.primaryDAOTokenDetailsViewModes = this.stageMetadata.primaryDAOTokenDetailsViewModes
  //     ?? this.getDefaultTokenDetailsViewModes(stageMeta.wizardType, this.wizardState.registrationData.primaryDAO);
  //   this.stageMetadata.partnerDAOTokenDetailsViewModes = this.stageMetadata.partnerDAOTokenDetailsViewModes
  //     ?? this.getDefaultTokenDetailsViewModes(stageMeta.wizardType, this.wizardState.registrationData.partnerDAO);
  //
  //   this.registrationData = this.wizardState.registrationData;
  //
  //   this.validationRules
  //     .on(this.registrationData)
  //     .ensure("fundingPeriod")
  //     .required()
  //     .when(() => !this.isOpenProposalWizard)
  //     .withMessage("Funding Period is required")
  //     .min(0)
  //     .withMessage("Funding Period should be greater or equal to zero");
  //
  //   this.wizardService.registerStageValidateFunction(this.wizardManager, async () => {
  //     const primaryTokensForms = this.primaryDAOTokenDetails.map(viewModel => viewModel.form);
  //     const partnerTokensForms = this.partnerDAOTokenDetails.map(viewModel => viewModel.form);
  //     const primaryTokensValid = await areFormsValid(primaryTokensForms);
  //     const partnerTokensValid = await areFormsValid(partnerTokensForms);
  //
  //     this.checkedForUnsavedChanges();
  //
  //     return this.form.validate()
  //       .then(async (result) => result.valid &&
  //         this.hasValidPrimaryDAOTokensDetailsCount &&
  //         !this.hasUnsavedChangesForPrimaryDetails &&
  //         !this.hasUnsavedChangesForPartnerDetails &&
  //         this.hasValidPartnerDAOTokensDetailsCount &&
  //         primaryTokensValid &&
  //         (this.isOpenProposalWizard ? true : partnerTokensValid),
  //       );
  //   });
  // }

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
