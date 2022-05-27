import "./pquestion-mark.scss";
import { Placement } from "tippy.js";
import { bindable, customElement } from "aurelia";

@customElement("pquestion-mark")
export class PQuestionMark {
  @bindable text: string;
  @bindable placement: Placement = "top";
  @bindable allowHTML = true;
}
