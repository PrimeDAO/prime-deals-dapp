import {customElement} from "aurelia-framework";
import "./pform-item.scss";
import {bindable} from "aurelia-typed-observable-plugin";
import {ValidationState} from "../types";

@customElement("pform-item")
export class PFormItem {
  @bindable public validationState?: ValidationState;
  @bindable label = "";
  @bindable labelExtra = "";
  @bindable message = "";
  @bindable.string helperMessage = "";
}
