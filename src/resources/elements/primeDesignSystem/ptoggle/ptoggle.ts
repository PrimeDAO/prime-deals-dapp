import "./ptoggle.scss";
import { ValidationState } from "../types";
import { bindable, BindingMode, customElement } from "aurelia";

@customElement("ptoggle")
export class PToggle {
  @bindable validationState?: ValidationState;
  @bindable disabled = false;
  @bindable({mode: BindingMode.twoWay}) value = false;
  @bindable changed: ({checked: boolean}) => void;

  private element: Element;

  constructor(element: Element) {
    this.element = element;
  }

}
