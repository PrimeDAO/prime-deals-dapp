import { child, customElement } from "aurelia-framework";
import "./pform-input.scss";
import { bindable } from "aurelia-typed-observable-plugin";
import { ValidationState } from "../types";
import { Disposable } from "aurelia-binding";
import tippy from "tippy.js";
import { AureliaHelperService } from "../../../../services/AureliaHelperService";

@customElement("pform-input")
export class PFormInput {
  @bindable.string label = "";
  @bindable.string labelInfo = "";
  @bindable.string labelDescription = "";
  @bindable.booleanAttr showCounter = false;
  @bindable.number maxLength = 0;
  @bindable.string helperMessage = "";
  @bindable validationMessage = "";
  @bindable.string validationState?: ValidationState;

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
  @child("*") input;

  private labelInfoIcon: HTMLElement;
  private inputValueObserverSubscription?: Disposable;

  constructor(
    private element: Element,
    private aureliaHelperService: AureliaHelperService,
  ) {
  }

  attached() {
    this.inputReference = this.inputReference ?? this.input;

    if (this.labelInfoIcon) {
      tippy(this.labelInfoIcon);
    }

    this.validationStateChanged(this.validationState);

    if (this.inputReference && this.showCounter) {
      this.limitInputCharacterLength();
    }
  }

  validationStateChanged(newValue?: ValidationState) {
    if (this.inputReference) {
      this.inputReference.validationState = newValue;
    }
  }

  private limitInputCharacterLength() {
    this.inputValueObserverSubscription = this.aureliaHelperService.createPropertyWatch(
      this.inputReference,
      "value",
      newValue => {
        if (newValue?.length > this.maxLength) {
          this.inputReference.value = newValue.substring(0, this.maxLength);
        }
      });
  }

  validationStateExists(state: ValidationState) {
    return Object.values(ValidationState).includes(state);
  }

  detached() {
    this.inputValueObserverSubscription?.dispose();
  }
}
