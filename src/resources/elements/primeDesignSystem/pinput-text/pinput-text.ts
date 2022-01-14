import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./pinput-text.scss";
import {ValidationState} from "../types";

@customElement("pinput-text")
export class PInputText {

  @bindable public validationState?: ValidationState;
  @bindable public autocomplete = "off";
  @bindable.booleanAttr public disabled;
  @bindable({defaultBindingMode: bindingMode.twoWay}) public value: string;
  @bindable.string public placeholder = "";
}
