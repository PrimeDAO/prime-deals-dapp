import { autoinject, bindingMode } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { validateTrigger, ValidationController, ValidationRules } from "aurelia-validation";
import { IClause } from "entities/DealRegistrationTokenSwap";
import { PrimeRenderer } from "resources/elements/primeDesignSystem/validation/primeRenderer";
import "./termClause.scss";

@autoinject
export class TermClause {
  @bindable clause: IClause;
  @bindable.number index: number;
  @bindable({defaultBindingMode: bindingMode.fromView}) form: ValidationController;
  @bindable onDelete: () => void;

  constructor(validationController: ValidationController) {
    this.form = validationController;
    this.form.validateTrigger = validateTrigger.change;
    this.form.addRenderer(new PrimeRenderer());
  }

  attached() {
    this.addValidationRules();
  }

  addValidationRules() {
    const rules = ValidationRules
      .ensure<IClause, string>(clause => clause.text)
      .required()
      .withMessage("Clause requires a description")
      .rules;

    this.form.addObject(this.clause, rules);
  }

  onSave(): Promise<boolean> {
    return this.form.validate().then(result => result.valid);
  }
}
