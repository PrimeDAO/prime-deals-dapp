import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./ptextarea.scss";
import {BigNumber} from "ethers";
import {ValidationState} from "../types";

@customElement("ptextarea")
export class PTextarea {

  @bindable public validationState?: ValidationState;

  @bindable public autocomplete = "off";
  @bindable.booleanAttr public disabled;
  @bindable.number public rows = 4;
  @bindable({defaultBindingMode: bindingMode.twoWay}) public value: string | BigNumber;
  @bindable.string public placeholder = "";
}
