import { IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";
import * as shortUuid from "short-uuid";
import { IWizardState, WizardService } from "../../../services/WizardService";
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
import { inject } from "aurelia";
import { areFormsValid } from "../../../../services/ValidationService";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationController } from "@aurelia/validation-html";
import { IValidationRules } from "@aurelia/validation";
import { PrimeErrorPresenter } from "../../../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";
import { IsEthAddress } from "../../../../resources/validation-rules";
import { NumberService, TokenService } from "../../../../services";

@inject()
export class TermsStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  termClauses: TermClause[] = [];
  hasUnsavedChanges = false;
  stageMetadata: {termsViewModes?: ViewMode[]} = {};

  terms: ITerms;
  daoplomatRewards?: IDaoplomatRewards;

  tokensTotal?: number;

  constructor(
    public wizardService: WizardService,
    @newInstanceForScope(IValidationController) public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
    public numberService: NumberService, // 'numberService' is used by the template
    private tokenService: TokenService,
    presenter: PrimeErrorPresenter,
  ) {
    this.form.addSubscriber(presenter);
  }

  async load(stageMeta: IStageMeta) {
    this.wizardManager = this.wizardService.currentWizard;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.stageMetadata = stageMeta.settings ?? {};
    this.stageMetadata.termsViewModes = this.stageMetadata.termsViewModes ?? this.getDefaultTermsViewModes(stageMeta.wizardType);

    this.terms = this.wizardState.registrationData.terms;

    this.wizardService.registerStageValidateFunction(this.wizardManager, async () => {
      this.addIdsToClauses(stageMeta.wizardType);
      this.checkedForUnsavedChanges();
      const formsAreValid = await areFormsValid(this.termClauses.map(viewModel => viewModel.form));
      const formResult = await this.form.validate();
      this.populateRegistrationData();
      return formResult.valid && formsAreValid && !this.hasUnsavedChanges;
    });

    this.bindDaoplomatRewards();

    this.tokensTotal = await this.wizardManager.getTokensTotalPrice();
  }

  onDelete(index: number): boolean | void {
    if (this.wizardState.registrationData.terms.clauses.length === 1) {
      return false;
    }

    this.termClauses.splice(index, 1);
    this.wizardState.registrationData.terms.clauses.splice(index, 1);
    this.stageMetadata.termsViewModes.splice(index, 1);
  }

  addClause() {
    const emptyClause: IClause = {
      id: "",
      text: "",
    };
    this.wizardState.registrationData.terms.clauses.push(emptyClause);
  }

  checkedForUnsavedChanges() {
    this.hasUnsavedChanges = this.termClauses.filter(viewModel => viewModel.viewMode === "edit").length > 0;
  }

  addIdsToClauses(wizardType: WizardType) {
    this.wizardState.registrationData.terms.clauses.forEach(clause => {
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
    return this.wizardState.registrationData.terms.clauses.map(() => isACreateWizard ? "edit" : "view");
  }

  toggleDaoplomatRewards = (active: boolean) => {
    if (active) {
      this.daoplomatRewards = {
        daoplomats: [],
      };

      this.wizardState.registrationData.terms.daoplomatRewards = this.daoplomatRewards;
      this.addDaoplomatRewardsValidation();
      this.addDaoplomat();
    } else {
      this.validationRules.off(this.daoplomatRewards);
      this.daoplomatRewards = undefined;
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
      .satisfiesRule(new IsEthAddress())
      .withMessage("Please enter a valid address or an ENS name")
      .satisfies((value) => this.daoplomatRewards.daoplomats.filter(daoplomat => daoplomat.address === value).length === 1)
      .withMessage("Address already used")
      .ensure("rewardSplitPercentage")
      .required()
      .withMessage("Split is required")
      .min(0.001)
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
      .min(0.001)
      .withMessage("The DAOplomat reward can not be lower than 0.001%")
      .max(5)
      .withMessage("The DAOplomat reward can not be higher than 5%")
    ;

    this.form.addObject(this.daoplomatRewards);
  }

  private bindDaoplomatRewards() {
    if (!this.terms.daoplomatRewards) {
      return;
    }

    this.daoplomatRewards = {
      percentage: this.terms.daoplomatRewards.percentage * 100,
      daoplomats: this.terms.daoplomatRewards?.daoplomats.map(daoplomat => {
        daoplomat.rewardSplitPercentage = daoplomat.rewardSplitPercentage / this.terms.daoplomatRewards.percentage * 100;
        return daoplomat;
      }),
    };
    this.addDaoplomatRewardsValidation();
    this.daoplomatRewards.daoplomats.forEach(this.addDaoplomatValidation.bind(this));
  }

  private populateRegistrationData() {
    if (!this.daoplomatRewards) {
      return;
    }

    this.wizardState.registrationData.terms.daoplomatRewards = {
      percentage: this.daoplomatRewards.percentage / 100,
      daoplomats: this.daoplomatRewards.daoplomats.map(daoplomat => ({
        ...daoplomat,
        rewardSplitPercentage: daoplomat.rewardSplitPercentage / 100 * (this.daoplomatRewards.percentage / 100),
      })),
    };
  }
}
