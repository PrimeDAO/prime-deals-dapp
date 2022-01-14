import {bindable} from "aurelia-typed-observable-plugin";
import {bindingMode, customElement} from "aurelia-framework";
import "./pinput-numeric.scss";
import {BigNumber} from "ethers";
import {ValidationState} from "../types";

@customElement("pinput-numeric")
export class PInputNumeric {

  @bindable public validationState?: ValidationState;

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
}
