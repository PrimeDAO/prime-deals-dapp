import { bindable, customElement } from "aurelia";
import "./pcircled-number.scss";

@customElement("pcircled-number")
export class PCircledNumber {
  @bindable number: number;
  @bindable checkMark: boolean;
  @bindable active: boolean;
  @bindable verified: boolean;
}
