import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./pinput-numeric.scss";
import {BigNumber} from "ethers";

enum ValidationState {
  ok = "ok",
  validating = "validating",
  warning = "warning",
  error = "error"
}

@customElement("pinput-numeric")
export class PInputNumeric {

  @bindable public validationState = ValidationState.ok;

  /**
   * Look into the numeric-input for more info about the below properties
   */
  @bindable.booleanAttr public decimal = true;
  @bindable.string public defaultText = "";
  @bindable public handleChange: ({keyCode: number}) => boolean;
  @bindable public autocomplete = "off";
  @bindable.booleanAttr public disabled;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) public value: number | BigNumber | string;
  @bindable.booleanAttr public notWei?: boolean = false;
  @bindable.number public decimals?: number = 18;
  @bindable.booleanAttr public outputAsString?: boolean = false;
  @bindable.string public placeholder = "";
  @bindable inFocus = false; //  attribute name "focus" doesn't work
}
