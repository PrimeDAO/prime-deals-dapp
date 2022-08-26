import { IClause } from "entities/DealRegistrationTokenSwap";
import { ViewMode } from "../../../../../resources/elements/editingCard/editingCard";
import { bindable, BindingMode, inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationRules } from "@aurelia/validation";
import {
  PrimeErrorPresenter,
} from "../../../../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";

@inject()
export class TermClause {
  @bindable({ callback: "revalidateClause" }) clause: IClause;
  @bindable index: number;
  @bindable({mode: BindingMode.twoWay}) viewMode: ViewMode = "edit";
  @bindable hideDeleteButton: boolean;
  @bindable onDelete: () => boolean | undefined;
  @bindable onSaved?: (clause: IClause) => void;
  @bindable charValueParent = 0;
  private editor = null;
  charValue = null;
  isEditorValid:boolean = null;

  constructor(
    @newInstanceForScope(IValidationController) public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
    private presenter: PrimeErrorPresenter,
  ) {
    this.form.addSubscriber(presenter);
  }

  async onSave() {
    const isValid = await this.form.validate().then(result => result.valid);
    this.isEditorValid = isValid;
    if (isValid) {
      this.onSaved?.(this.clause);
    }
    return isValid;
  }

  attaching(){
    this.validationRules
      .on(this.clause)
      .ensure("title")
      .required()
      .withMessage("Clause requires a title")
      .ensure("text")
      .required()
      .withMessage("Clause requires a description")
      .minLength(17)
      .withMessage("Clause must be at least 10 characters");
  }

  shouldSetText() {
    return !this.editor.getData() && this.clause?.text;
  }

  delete() {
    if (this.onDelete()) {
      return;
    }
    this.form.removeObject(this.clause);
  }

  viewModeChanged(newValue: ViewMode) {
    if (newValue === "view") {
      this.onSaved?.(this.clause);
    }
  }
}
