import { bindable, customElement } from "aurelia";
import { IStepperStep } from "../types";

@customElement("pstepper")
export class PStepper {
  @bindable steps: IStepperStep[];
  @bindable indexOfActive: number;
  @bindable onClick: (index: number) => void;

  bind() {
    this.steps = this.steps.filter(step => !step.hidden);
  }
}
