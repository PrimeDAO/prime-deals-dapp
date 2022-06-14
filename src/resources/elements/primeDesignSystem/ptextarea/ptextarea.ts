import "./ptextarea.scss";
import { BigNumber } from "ethers";
import { ValidationState } from "../types";
import { bindable, BindingMode, customElement } from "aurelia";

@customElement("ptextarea")
export class PTextarea {

  @bindable validationState?: ValidationState;
  @bindable max?: number;
  @bindable autocomplete = "off";
  @bindable disabled = false;
  @bindable rows = 4;
  @bindable({mode: BindingMode.twoWay}) value: string | BigNumber;
  @bindable placeholder = "";
  @bindable resizable = true;
}
