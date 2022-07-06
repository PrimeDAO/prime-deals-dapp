import { bindable, customElement } from "aurelia";
import { IWizardStage } from "../../../../wizards/services/WizardService";

@customElement("pstepper")
export class PStepper {
  @bindable steps: IWizardStage[];
  @bindable index: number;
  @bindable onClick: (index: number) => void;

  binding() {
    this.steps = this.steps?.filter(step => !step.hidden);
  }
}
