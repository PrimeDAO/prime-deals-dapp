import { ValidationState } from "../types";
import { AureliaHelperService } from "../../../../services/AureliaHelperService";
import { bindable, children, customElement } from "aurelia";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../temporary-code";

@customElement("pform-input")
@processContent(autoSlot)
export class PFormInput {
  @bindable label = "";
  @bindable labelInfo = "";
  @bindable labelDescription = "";
  @bindable showCounter = false;
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

  constructor(
    private element: Element,
    private aureliaHelperService: AureliaHelperService,
  ) {
    console.log("thin ->", this);
  }

  inputsChanged() {
    this.inputReference = this.inputReference ?? this.inputs[0];

    if (this.inputReference && this.showCounter) {
      // this.limitInputCharacterLength(); // TODO add this method back
    }
    this.validationStateChanged(this.validationState);
  }

  validationStateChanged(newValue?: ValidationState) {
    if (this.inputReference) {
      this.inputReference.validationState = newValue;
    }
  }

  // private limitInputCharacterLength() {
  //   this.inputValueObserverSubscription = this.aureliaHelperService.createPropertyWatch(
  //     this.inputReference,
  //     "value",
  //     newValue => {
  //       if (newValue?.length > this.maxLength) {
  //         this.inputReference.value = newValue.substring(0, this.maxLength);
  //       }
  //     });
  // }

  validationStateExists(state: ValidationState) {
    return Object.values(ValidationState).includes(state);
  }

  // detached() {
  //   this.inputValueObserverSubscription?.dispose();
  // }
}
