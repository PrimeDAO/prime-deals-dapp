import { customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./pquestion-mark.scss";
import { Placement } from "tippy.js";

@customElement("pquestion-mark")
export class PQuestionMark {
  @bindable.string text: string;
  @bindable.string placement: Placement = "top";
  @bindable.booleanAttr allowHTML = true;
}
