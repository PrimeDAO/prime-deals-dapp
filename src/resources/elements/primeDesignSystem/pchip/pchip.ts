import { bindable } from "aurelia-typed-observable-plugin";
import { customElement } from "aurelia-framework";
import "./pchip.scss";

@customElement("pchip")
export class PChip {
  @bindable.string color = "";
}
