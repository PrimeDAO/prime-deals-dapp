import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./pinput-text.scss";
import {ValidationState} from "../types";

@customElement("pinput-text")
export class PInputText {

  @bindable validationState?: ValidationState;
  @bindable autocomplete = "off";
  @bindable.booleanAttr disabled = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value: string;
  @bindable.string placeholder = "";
}
