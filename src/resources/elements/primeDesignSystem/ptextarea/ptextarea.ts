import {BigNumber} from "ethers";
import {ValidationState} from "../types";
import { customElement, bindable, BindingMode } from "aurelia";

@customElement("ptextarea")
export class PTextarea {

  @bindable validationState?: ValidationState;

  @bindable autocomplete = "off";
  @bindable disabled = false;
  @bindable rows = 4;
  @bindable({mode: BindingMode.twoWay}) value: string | BigNumber;
  @bindable placeholder = "";
  @bindable resizable = true;
}
