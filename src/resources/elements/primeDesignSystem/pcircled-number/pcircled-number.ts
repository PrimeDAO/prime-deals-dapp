import { containerless, customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./pcircled-number.scss";

@containerless
@customElement("pcircled-number")
export class PCircledNumber {
  @bindable.number number: number;
  @bindable.booleanAttr checkMark: boolean;
  @bindable.booleanAttr active: boolean;
  @bindable.booleanAttr verified: boolean;
}
