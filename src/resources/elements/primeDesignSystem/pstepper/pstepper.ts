import { bindable, customElement } from "aurelia";
import { IWizardStage } from "../../../../wizards/services/WizardService";

@customElement("pstepper")
export class PStepper {
  @bindable steps: IWizardStage[];
  @bindable indexOfActive: number;
  @bindable onClick: (index: number) => void;

  bind() {
    this.steps = this.steps.filter(step => !step.hidden);
  }
}
