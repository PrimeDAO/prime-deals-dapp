import {BindingEngine, child, customElement} from "aurelia-framework";
import "./pform-input.scss";
import {bindable, observable} from "aurelia-typed-observable-plugin";
import {ValidationState} from "../types";
import {Disposable} from "aurelia-binding";
import tippy from "tippy.js";

@customElement("pform-input")
export class PFormInput {
  @bindable.string label = "";
  @bindable.string labelInfo = "";
  @bindable.string labelDescription = "";
  @bindable.booleanAttr showCounter = false;
  @bindable.number maxLength = 0;
  @bindable.string helperMessage = "";
  @bindable validationMessage = "";
  @bindable.string @observable validationState?: ValidationState;
  /**
   * This "child" selector is used to select any input used within the "pform-input" element.
   *  With it, we can get the character length used in the "max characters" counter section.
   */
  @child("*") input;

  private labelInfoIcon: HTMLElement;

  private inputValueObserverSubscription?: Disposable;

  constructor(private element: Element, private bindingEngine: BindingEngine) {
  }

  attached() {
    if (this.labelInfoIcon) {
      tippy(this.labelInfoIcon);
    }

    this.validationStateChanged(this.validationState);

    if (this.input && this.showCounter) {
      this.limitInputCharacterLength();
    }
  }

  private limitInputCharacterLength() {
    const inputValueObserver = this.bindingEngine.propertyObserver(this.input, "value");
    this.inputValueObserverSubscription = inputValueObserver.subscribe(newValue => {
      if (newValue?.length > this.maxLength) {
        this.input.value = newValue.substring(0, this.maxLength);
      }
    });
  }

  validationStateChanged(newValue?: ValidationState) {
    if (this.input) {
      this.input.validationState = newValue;
    }
  }

  validationStateExists(state: ValidationState) {
    return Object.values(ValidationState).includes(state);
  }

  detached() {
    this.inputValueObserverSubscription?.dispose();
  }
}
