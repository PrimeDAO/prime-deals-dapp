import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./pinput-text.scss";
import {BigNumber} from "ethers";
import {ValidationState} from "../types";

@customElement("pinput-text")
export class PInputText {

  @bindable public validationState = ValidationState.ok;

  /**
   * Look into the numeric-input for more info about the below properties
   */
  @bindable.string public defaultText = "";
  @bindable public handleChange: ({keyCode: number}) => boolean;
  @bindable public autocomplete = "off";
  @bindable.booleanAttr public disabled;
  @bindable({defaultBindingMode: bindingMode.twoWay}) public value: string | BigNumber;
  @bindable.string public placeholder = "";
  @bindable inFocus = false; //  attribute name "focus" doesn't work
}
