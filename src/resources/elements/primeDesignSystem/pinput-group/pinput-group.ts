import { customElement, child } from "aurelia-framework";
import "./pinput-group.scss";

@customElement("pinput-group")
export class PInputGroup {
  element: Element;
  @child("[slot='before']") beforeSlot;
  @child("[slot='after']") afterSlot;

  constructor(element: Element) {
    this.element = element;
  }
}
