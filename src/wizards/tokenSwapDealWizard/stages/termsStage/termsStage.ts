import { IBaseWizardStage, IStageMeta, WizardType } from "../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import * as shortUuid from "short-uuid";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IClause, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import "./termsStage.scss";
import { areFormsValid } from "../../../../services/ValidationService";
import { TermClause } from "./termClause/termClause";
import { ViewMode } from "../../../../resources/elements/editingCard/editingCard";

@autoinject
export class TermsStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  termClauses: TermClause[] = [];
  hasUnsavedChanges = false;
  stageMetadata: { termsViewModes?: ViewMode[] } = {};

  constructor(
    public wizardService: WizardService,
  ) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.stageMetadata = stageMeta.settings;
    this.stageMetadata.termsViewModes = this.stageMetadata.termsViewModes ?? this.getDefaultTermsViewModes(stageMeta.wizardType);

    this.wizardService.registerStageValidateFunction(this.wizardManager, async () => {
      this.addIdsToClauses();
      this.checkedForUnsavedChanges();
      const formsAreValid = await areFormsValid(this.termClauses.map(viewModel => viewModel.form));
      return formsAreValid && !this.hasUnsavedChanges;
    });
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

  addIdsToClauses() {
    this.wizardState.registrationData.terms.clauses.forEach(clause => {
      if (!clause.id) {
        clause.id = shortUuid.generate();
      }
    });
  }

  private getDefaultTermsViewModes(wizardType: WizardType): ViewMode[] {
    const isACreateWizard = [WizardType.createOpenProposal, WizardType.createPartneredDeal].includes(wizardType);
    return this.wizardState.registrationData.terms.clauses.map(() => isACreateWizard ? "edit" : "view");
  }
}
