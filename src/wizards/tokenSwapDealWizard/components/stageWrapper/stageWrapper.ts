import { bindable } from "aurelia-typed-observable-plugin";
import "./stageWrapper.scss";

export class stageWrapper {
  @bindable header: string;
  @bindable wizardManager: any;
  @bindable showSubmit = false;
  @bindable onSubmit: () => void;
}
