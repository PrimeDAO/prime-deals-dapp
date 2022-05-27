import "./pinput-numeric.scss";
import {BigNumber} from "ethers";
import {ValidationState} from "../types";
import { bindable, BindingMode, customElement } from "aurelia";

@customElement("pinput-numeric")
export class PInputNumeric {

  @bindable public validationState?: ValidationState;

  /**
   * Look into the numeric-input for more info about the below properties
   */
  @bindable decimal = true;
  @bindable defaultText = "";
  @bindable handleChange: ({keyCode: number}) => boolean;
  @bindable autocomplete = "off";
  @bindable disabled = false;
  @bindable({mode: BindingMode.twoWay}) value: number | BigNumber | string;
  @bindable notWei?: boolean = false;
  @bindable decimals?: number;
  @bindable outputAsString?: boolean = false;
  @bindable placeholder = "";
}
