import { autoinject, bindingMode } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
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
  @bindable.number index: number;
  @bindable({ defaultBindingMode: bindingMode.fromView })
    form: ValidationController;
  @bindable onDelete: () => void;
  @bindable.boolean disableDeleteButton: boolean;

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
    ).required().rules;

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
