import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./ptextarea.scss";
import {BigNumber} from "ethers";
import {ValidationState} from "../types";

@customElement("ptextarea")
export class PTextarea {

  @bindable validationState?: ValidationState;

  @bindable autocomplete = "off";
  @bindable.booleanAttr disabled = false;
  @bindable.number rows = 4;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value: string | BigNumber;
  @bindable.string placeholder = "";
  @bindable.booleanAttr resizable = true;
}
