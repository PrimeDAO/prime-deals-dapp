import { ValidationState } from "../types";
import { bindable, children, customElement } from "aurelia";
import { toBoolean } from "resources/binding-behaviours";

@customElement("pform-input")
export class PFormInput {
  @bindable label = "";
  @bindable labelInfo = "";
  @bindable labelDescription = "";
  @bindable({set: toBoolean, type: Boolean}) showCounter = false;
  @bindable maxLength = 0;
  @bindable helperMessage = "";
  @bindable validationMessage = "";
  @bindable validationState?: ValidationState;

  /*
  * By default, "pform-input" will select its first child as the "input" property.
  * When the "pform-input" has more children, you can pass a custom selector that can be used to select the "input" property
  * The value of this property must be a 'view-model' reference of the input.
  * Example:
  *   <pform-input input-reference.bind="myInputReference">
  *     <pinput-text view-model.ref="myInputReference"></pinput-text>
  *     <div>some random child</div>
  *   </pform-input>
  * */
  @bindable inputReference;

  /**
   * This "child" selector is used to select any input used within the "pform-input" element.
   *  With it, we can get the character length used in the "max characters" counter section.
   */
  @children({
    query: x => x.host.querySelectorAll("*"),
    filter: (node, controller) => Boolean(controller?.definition.bindables["validationState"]),
  }) inputs;

  inputsChanged() {
    this.inputReference = this.inputReference ?? this.inputs[0];
    this.validationStateChanged(this.validationState);
  }

  validationStateChanged(newValue?: ValidationState) {
    if (this.inputReference) {
      this.inputReference.validationState = newValue;
    }
  }

  validationStateExists(state: ValidationState) {
    return Object.values(ValidationState).includes(state);
  }
}
