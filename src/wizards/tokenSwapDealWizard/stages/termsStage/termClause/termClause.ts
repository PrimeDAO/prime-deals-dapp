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
import "./termClause.scss";
import { ViewMode } from "../../../../../resources/elements/editingCard/editingCard";

@autoinject
export class TermClause {
  @bindable clause: IClause;
  @bindable.number index: number;
  @bindable({defaultBindingMode: bindingMode.fromView}) form: ValidationController;
  @bindable({defaultBindingMode: bindingMode.twoWay}) viewMode: ViewMode = "edit";
  @bindable.boolean hideDeleteButton: boolean;
  @bindable onDelete: () => boolean | undefined;
  @bindable onSaved?: () => void;

  constructor(private validationControllerFactory: ValidationControllerFactory) {
    this.form = this.validationControllerFactory.createForCurrentScope();
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
      .minLength(10)
      .withMessage("Clause must be at least ${$config.length} characters")
      .rules;

    this.form.addObject(this.clause, rules);
  }

  onSave(): Promise<boolean> {
    return this.form.validate().then(result => result.valid);
  }

  delete() {
    if (this.onDelete()) {
      return;
    }
    this.form.removeObject(this.clause);
  }

  viewModeChanged(newValue: "edit" | "view") {
    if (newValue === "view") {
      this.onSaved?.();
    }
  }
}
