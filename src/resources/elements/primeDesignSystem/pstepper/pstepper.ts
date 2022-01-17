import { customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { IStepperStep } from "../types";
import "./pstepper.scss";

@customElement("pstepper")
export class PStepper {
  @bindable steps: IStepperStep[];
  @bindable indexOfActive: number;
  @bindable onClick: (index: number) => void;
}
