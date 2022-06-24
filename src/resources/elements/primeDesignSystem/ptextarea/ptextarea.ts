import "./ptextarea.scss";
import { ValidationState } from "../types";
import { bindable, BindingMode, customElement } from "aurelia";

@customElement("ptextarea")
export class PTextarea {
  private textarea: HTMLTextAreaElement;

  @bindable validationState?: ValidationState;
  @bindable max: number;
  @bindable autocomplete = "off";
  @bindable disabled = false;
  @bindable rows = 4;
  @bindable({mode: BindingMode.twoWay}) value: string;
  @bindable placeholder = "";
  @bindable resizable = true;

  bound(){
    if (this.textarea && this.max > 0){
      this.textarea?.setAttribute("maxlength", `${this.max}`);
    }
  }
}
