import "./ptextarea.scss";
import { BigNumber } from "ethers";
import { ValidationState } from "../types";
import { bindable, BindingMode, customElement } from "aurelia";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../temporary-code";

@customElement("ptextarea")
@processContent(autoSlot)
export class PTextarea {

  @bindable validationState?: ValidationState;

  @bindable autocomplete = "off";
  @bindable disabled = false;
  @bindable rows = 4;
  @bindable({mode: BindingMode.twoWay}) value: string | BigNumber;
  @bindable placeholder = "";
  @bindable resizable = true;
}
