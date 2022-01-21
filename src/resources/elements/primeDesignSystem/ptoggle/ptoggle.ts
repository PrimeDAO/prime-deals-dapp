import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./ptoggle.scss";
import {ValidationState} from "../types";

@customElement("ptoggle")
export class PToggle {
  @bindable validationState?: ValidationState;
  @bindable.booleanAttr disabled = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = false;
}
