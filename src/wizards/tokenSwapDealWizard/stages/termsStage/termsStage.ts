import { IBaseWizardStage, IStageMeta } from "../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IClause, IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { ValidationController } from "aurelia-validation";
import "./termsStage.scss";
import { areFormsValid } from "../../../../services/ValidationService";

@autoinject
export class TermsStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  private termsForms: ValidationController[] = [];

  constructor(public wizardService: WizardService) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.wizardService.registerStageValidateFunction(this.wizardManager, () => areFormsValid(this.termsForms));
  }

  onDelete(index: number) {
    if (this.wizardState.registrationData.terms.clauses.length === 1) {
      this.wizardState.registrationData.terms.clauses[0].text = "";
      // This `return true` is used by the termClause component
      return true;
    }

    this.termsForms.splice(index, 1);
    this.wizardState.registrationData.terms.clauses.splice(index, 1);
  }

  addClause() {
    const emptyClause: IClause = {
      id: "",
      text: "",
    };
    this.wizardState.registrationData.terms.clauses.push(emptyClause);
  }
}
