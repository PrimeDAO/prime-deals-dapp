import {customElement} from "aurelia-framework";
import "./pform-input.scss";
import {bindable} from "aurelia-typed-observable-plugin";
import {ValidationState} from "../types";

@customElement("pform-input")
export class PFormInput {
  @bindable public validationState?: ValidationState;
  @bindable label = "";
  @bindable labelExtra = "";
  @bindable message = "";
  @bindable.string helperMessage = "";
}
