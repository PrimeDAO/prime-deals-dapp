import { autoinject, bindable, bindingMode } from "aurelia-framework";
import {
  validateTrigger,
  ValidationController,
  ValidationControllerFactory,
  ValidationRules,
} from "aurelia-validation";
import { IClause } from "entities/DealRegistrationTokenSwap";
import { PrimeRenderer } from "resources/elements/primeDesignSystem/validation/primeRenderer";

@autoinject
export class TermClause {
  @bindable clause: IClause;
  @bindable index: number;
  @bindable({ defaultBindingMode: bindingMode.fromView })
    form: ValidationController;
  @bindable onDelete: () => void;

  constructor(
    private validationControllerFactory: ValidationControllerFactory,
  ) {
    this.form = this.validationControllerFactory.createForCurrentScope();
    this.form.validateTrigger = validateTrigger.change;
    this.form.addRenderer(new PrimeRenderer());
  }

  attached() {
    this.addValidationRules();
  }

  addValidationRules() {
    const rules = ValidationRules.ensure<IClause, string>(
      (clause) => clause.text,
    )
      .required()
      .minLength(1).rules;

    this.form.addObject(this.clause, rules);
  }

  async onSave(): Promise<boolean> {
    const result = await this.form.validate();

    if (!result.valid) {
      return false;
    }

    return true;
  }
}
