import { child, customElement } from "aurelia-framework";
import "./pinput-group.scss";
import { bindable } from "aurelia-typed-observable-plugin";

@customElement("pinput-group")
export class PInputGroup {
  element: Element;
  @bindable.booleanAttr() disabled = false;
  @child("[slot='before']") beforeSlot;
  @child("[slot='after']") afterSlot;

  constructor(element: Element) {
    this.element = element;
  }
}
