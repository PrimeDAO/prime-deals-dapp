import {BindingEngine, child, customElement} from "aurelia-framework";
import "./pform-input.scss";
import {bindable, observable} from "aurelia-typed-observable-plugin";
import {ValidationState} from "../types";
import {Disposable} from "aurelia-binding";

@customElement("pform-input")
export class PFormInput {
  @bindable.string @observable validationState?: ValidationState;
  @bindable.string label = "";
  @bindable.string labelDescription = "";
  @bindable validationMessage = "";
  @bindable.boolean showCounter = false;
  @bindable.number maxValue = 0;
  @bindable.string helperMessage = "";
  /**
   * This "child" selector is used to select any input used within the "pform-input" element.
   *  With it, we can get the character length used in the "max characters" counter section.
   */
  @child("*") input;

  private inputValueObserverSubscription?: Disposable;

  constructor(private element: Element, private bindingEngine: BindingEngine) {
  }

  attached() {
    this.validationStateChanged(this.validationState);

    if (this.input && this.showCounter) {
      this.limitInputCharacterLength();
    }
  }

  private limitInputCharacterLength() {
    const inputValueObserver = this.bindingEngine.propertyObserver(this.input, "value");
    this.inputValueObserverSubscription = inputValueObserver.subscribe(newValue => {
      if (newValue?.length > this.maxValue) {
        this.input.value = newValue.substring(0, this.maxValue);
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
