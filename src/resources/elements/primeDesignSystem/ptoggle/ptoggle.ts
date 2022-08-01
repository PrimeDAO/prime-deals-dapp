import { ValidationState } from "../types";
import { bindable, BindingMode, customElement } from "aurelia";
import { toBoolean } from "../../../binding-behaviours";

@customElement("ptoggle")
export class PToggle {
  @bindable validationState?: ValidationState;
  @bindable disabled = false;
  @bindable({set: toBoolean, type: Boolean, mode: BindingMode.twoWay}) value = false;
  @bindable changed: (checked: boolean) => void;

  private element: Element;

  constructor(element: Element) {
    this.element = element;
  }

}
