import { ValidationState } from "../types";
import { bindable, BindingMode, customElement } from "aurelia";

@customElement("pinput-text")
export class PInputText {
  private input: HTMLInputElement;
  @bindable max: number;
  @bindable validationState?: ValidationState;
  @bindable autocomplete = "off";
  @bindable disabled = false;
  @bindable({mode: BindingMode.twoWay}) value: string;
  @bindable placeholder = "";

  bound(){
    if (this.input && this.max > 0){
      this.input?.setAttribute("maxlength", `${this.max}`);
    }
  }
}
