import { IStageMeta } from "../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { IWizardState, WizardService } from "../../../services/WizardService";
import {
  IClause,
  IDealRegistrationTokenSwap,
} from "entities/DealRegistrationTokenSwap";
import {
  ValidationController,
  ValidationControllerFactory,
} from "aurelia-validation";
import "./termsStage.scss";

@autoinject
export class TermsStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  private termsForms: ValidationController[] = [];
  private form: ValidationController;

  constructor(
    public wizardService: WizardService,
    private validationControllerFactory: ValidationControllerFactory,
  ) {}

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.addValidation();
  }

  onDelete(index: number) {
    this.termsForms.splice(index, 1);
    this.wizardState.registrationData.terms.clauses.splice(index, 1);
  }

  addClauseButton() {
    const emptyClause: IClause = {
      id: "",
      text: "",
    };
    this.wizardState.registrationData.terms.clauses.push(emptyClause);
  }

  addValidation() {
    this.form = this.validationControllerFactory.createForCurrentScope();

    this.wizardService.registerStageValidateFunction(
      this.wizardManager,
      async () => {
        const termsValidationResults = await Promise.all(
          this.termsForms.map((form) =>
            form.validate().then((result) => result.valid),
          ),
        );

        return this.form
          .validate()
          .then(
            (result) =>
              result.valid &&
              Boolean(termsValidationResults.filter(Boolean).length),
          );
      },
    );
  }
}
