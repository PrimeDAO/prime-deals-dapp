import "./pinput-text.scss";
import {ValidationState} from "../types";
import { bindable, BindingMode, customElement } from "aurelia";

@customElement("pinput-text")
export class PInputText {

  @bindable validationState?: ValidationState;
  @bindable autocomplete = "off";
  @bindable disabled = false;
  @bindable({mode: BindingMode.twoWay}) value: string;
  @bindable placeholder = "";
}
