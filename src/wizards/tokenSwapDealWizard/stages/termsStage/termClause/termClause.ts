import { IClause } from "entities/DealRegistrationTokenSwap";
import "./termClause.scss";
import { ViewMode } from "../../../../../resources/elements/editingCard/editingCard";
import { bindable, BindingMode, inject } from "aurelia";
import { IValidationController, ValidationControllerFactory } from "@aurelia/validation-html";

@inject()
export class TermClause {
  @bindable clause: IClause;
  @bindable index: number;
  @bindable({mode: BindingMode.fromView}) form: IValidationController;
  @bindable({mode: BindingMode.twoWay}) viewMode: ViewMode = "edit";
  @bindable hideDeleteButton: boolean;
  @bindable onDelete: () => boolean | undefined;
  @bindable onSaved?: () => void;

  constructor(private validationControllerFactory: ValidationControllerFactory) {
    // this.form = this.validationControllerFactory.createForCurrentScope();
    // this.form.validateTrigger = validateTrigger.change;
    // this.form.addRenderer(new PrimeRenderer());
  }

  attached() {
    this.addValidationRules();
  }

  addValidationRules() {
    // const rules = ValidationRules // TODO add rules back
    //   .ensure<IClause, string>(clause => clause.text)
    //   .required()
    //   .withMessage("Clause requires a description")
    //   .minLength(10)
    //   .withMessage("Clause must be at least ${$config.length} characters")
    //   .rules;
    //
    // this.form.addObject(this.clause, rules);
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
