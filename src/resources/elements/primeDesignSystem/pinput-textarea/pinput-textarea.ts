import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./pinput-textarea.scss";
import {BigNumber} from "ethers";
import {ValidationState} from "../types";

@customElement("pinput-textarea")
export class PinputTextarea {

  @bindable public validationState = ValidationState.ok;

  /**
   * Look into the numeric-input for more info about the below properties
   */
  @bindable public handleChange: ({keyCode: number}) => boolean;
  @bindable public autocomplete = "off";
  @bindable.booleanAttr public disabled;
  @bindable.number public rows = 4;
  @bindable({defaultBindingMode: bindingMode.twoWay}) public value: string | BigNumber;
  @bindable.string public placeholder = "";
  @bindable inFocus = false; //  attribute name "focus" doesn't work
}
