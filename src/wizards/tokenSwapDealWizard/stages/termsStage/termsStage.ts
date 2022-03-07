import { IBaseWizardStage, IStageMeta } from "../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IClause, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import "./termsStage.scss";
import { areFormsValid } from "../../../../services/ValidationService";
import { TermClause } from "./termClause/termClause";

@autoinject
export class TermsStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  termClauses: TermClause[] = [];
  hasUnsavedChanges = false;

  constructor(
    public wizardService: WizardService,
  ) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.wizardService.registerStageValidateFunction(this.wizardManager, async () => {
      this.checkedForUnsavedChanges();
      return await areFormsValid(this.termClauses.map(viewModel => viewModel.form)) && !this.hasUnsavedChanges;
    });
  }

  onDelete(index: number) {
    if (this.wizardState.registrationData.terms.clauses.length === 1) {
      this.wizardState.registrationData.terms.clauses[0].text = "";
      // This `return true` is used by the termClause component
      return true;
    }

    this.termClauses.splice(index, 1);
    this.wizardState.registrationData.terms.clauses.splice(index, 1);
    this.checkedForUnsavedChanges();
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
}
