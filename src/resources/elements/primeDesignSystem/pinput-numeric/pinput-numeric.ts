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
  @bindable.booleanAttr decimal = true;
  @bindable.string defaultText = "";
  @bindable handleChange: ({keyCode: number}) => boolean;
  @bindable autocomplete = "off";
  @bindable.booleanAttr disabled = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value: number | BigNumber | string;
  @bindable.booleanAttr notWei?: boolean = false;
  @bindable.number decimals?: number = 18;
  @bindable.booleanAttr outputAsString?: boolean = false;
  @bindable.string placeholder = "";
}
