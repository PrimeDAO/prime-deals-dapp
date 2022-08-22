import { IStageMeta, WizardType } from "../../dealWizardTypes";
import * as shortUuid from "short-uuid";
import {
  IClause,
  IDaoplomatReward,
  IDaoplomatRewards,
  IDealRegistrationTokenSwap,
  ITerms,
} from "entities/DealRegistrationTokenSwap";
import "./termsStage.scss";
import { TermClause } from "./termClause/termClause";
import { ViewMode } from "../../../../resources/elements/editingCard/editingCard";
import { Controller, IContainer, inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { IValidationRules } from "@aurelia/validation";
import { PrimeErrorPresenter } from "../../../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";
import { IsEthAddressOrEns } from "../../../../resources/validation-rules";
import { EnsService, NumberService, TokenService } from "../../../../services";
import { WizardManager } from "../../wizardManager";
import { areFormsValid } from "../../../../services/ValidationService";

@inject()
export class TermsStage {
  public wizardState: any;

  termClauses: TermClause[] = [];
  hasUnsavedChanges = false;
  stageMetadata: {termsViewModes?: ViewMode[]} = {};

  terms: ITerms;
  daoplomatRewards?: IDaoplomatRewards;

  tokensTotal?: number;

  private readonly minimumSplitPercentage = 0.001;
  private readonly maximumSplitPercentage = 5;
  private wizardType: WizardType;

  constructor(
    @IContainer public container: IContainer,
    @inject("registrationData") private readonly registrationData: IDealRegistrationTokenSwap,
    @IValidationController public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
    public numberService: NumberService, // 'numberService' is used by the template
    private tokenService: TokenService,
    presenter: PrimeErrorPresenter,
    private ensService: EnsService,
  ) {
  }

  async load(stageMeta: IStageMeta) {
    this.stageMetadata = stageMeta.settings ?? {};
    this.stageMetadata.termsViewModes = this.stageMetadata.termsViewModes ?? this.getDefaultTermsViewModes(stageMeta.wizardType);

    this.terms = this.registrationData.terms;
    this.wizardType = stageMeta.wizardType;

    this.validationRules
      .on(this.terms)
      .ensureObject()
      .satisfies(async () => {
        this.checkedForUnsavedChanges();
        const formsAreValid = await areFormsValid(this.termClauses.filter(Boolean).map(viewModel => viewModel.form));
        return formsAreValid && !this.hasUnsavedChanges;
      })
      .withMessage("<no display>")
    ;

    this.form.addObject(this.terms);

    this.daoplomatRewards = this.registrationData.terms.daoplomatRewards;
  }

  async bound(context: Controller, parentContext: Controller) {
    const wizardManager = parentContext.parent.viewModel as WizardManager;
    this.addIdsToClauses(this.wizardType);
    this.tokensTotal = await wizardManager.getTokensTotalPrice();
  }

  onDelete(index: number): boolean | void {
    if (this.registrationData.terms.clauses.length === 1) {
      return false;
    }

    this.termClauses.splice(index, 1);
    this.registrationData.terms.clauses.splice(index, 1);
    this.stageMetadata.termsViewModes.splice(index, 1);
    this.checkedForUnsavedChanges();
  }

  addClause() {
    const emptyClause: IClause = {
      id: shortUuid.generate(),
      text: "",
      title: "",
    };
    this.registrationData.terms.clauses.push(emptyClause);
  }

  checkedForUnsavedChanges() {
    this.hasUnsavedChanges = this.termClauses.filter(Boolean).filter(viewModel => viewModel.viewMode === "edit").length > 0;
  }

  addIdsToClauses(wizardType: WizardType) {
    this.registrationData.terms.clauses.forEach(clause => {
      /**
       * 1. !clause.id: If non, generate one.
       * 2. `makeAnOffer`: Generate new ids, else Open Proposal and the new Partnered Deal, will have same ids.
       */
      if (!clause.id || wizardType === WizardType.makeAnOffer) {
        clause.id = shortUuid.generate();
      }
    });
  }

  private getDefaultTermsViewModes(wizardType: WizardType): ViewMode[] {
    const isACreateWizard = [WizardType.createOpenProposal, WizardType.createPartneredDeal].includes(wizardType);
    return this.registrationData.terms.clauses.map(() => isACreateWizard ? "edit" : "view");
  }

  toggleDaoplomatRewards = (active: boolean) => {
    if (active) {
      this.daoplomatRewards = {
        daoplomats: [],
      };

      this.registrationData.terms.daoplomatRewards = this.daoplomatRewards;
      this.addDaoplomatRewardsValidation();
      this.addDaoplomat();
    } else {
      this.validationRules.off(this.daoplomatRewards);
      this.daoplomatRewards = undefined;
      delete this.registrationData.terms.daoplomatRewards;
    }

  };

  addDaoplomat() {
    const daoplomat: IDaoplomatReward = {
      address: "",
      rewardSplitPercentage: undefined,
    };
    this.daoplomatRewards?.daoplomats.push(daoplomat);
    this.addDaoplomatValidation(daoplomat);
  }

  removeDaoplomat(index: number) {
    this.daoplomatRewards.daoplomats.splice(index, 1);
  }

  private addDaoplomatValidation(daoplomat: IDaoplomatReward) {
    this.validationRules
      .on(daoplomat)
      .ensure("address")
      .required()
      .withMessage("Please enter an address or an ENS name")
      .satisfiesRule(new IsEthAddressOrEns(this.ensService))
      .withMessage("Please enter a valid address or an ENS name")
      .satisfies((value) => this.daoplomatRewards.daoplomats.filter(daoplomat => daoplomat.address === value).length === 1)
      .withMessage("Address already used")
      .ensure("rewardSplitPercentage")
      .required()
      .withMessage("Split is required")
      .min(this.minimumSplitPercentage)
      .withMessage("A reward distribution can not be lower than 0.001%")
      .max(100)
      .withMessage("The reward distribution should add up to 100%")
    ;
  }

  private addDaoplomatRewardsValidation() {
    if (!this.daoplomatRewards) {
      return;
    }
    this.validationRules
      .on(this.daoplomatRewards)
      .ensureObject()
      .satisfies((daoplomatRewards: IDaoplomatRewards) => {
        return daoplomatRewards.daoplomats.reduce((total, daoplomat) => total + daoplomat.rewardSplitPercentage, 0) === 100;
      })
      .withMessage("The DAOplomat reward should add up to 100%.")
      .ensure("percentage")
      .required()
      .withMessage("Please specify amount for the reward")
      .min(this.minimumSplitPercentage)
      .withMessage("The DAOplomat reward can not be lower than 0.001%")
      .max(this.maximumSplitPercentage)
      .withMessage("The DAOplomat reward can not be higher than 5%")
    ;

    this.form.addObject(this.daoplomatRewards);
  }

  setClause(index: number, clause: IClause) {
    this.terms.clauses[index] = clause;
  }
}
