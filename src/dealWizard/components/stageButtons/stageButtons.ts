import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { WizardService } from "../../../services/WizardService";

import "./stageButtons.scss";

@autoinject
export class stageButtons {
  @bindable wizardManager: any;
  @bindable validate: () => boolean;
  @bindable showSubmit = false;

  constructor(public wizardService: WizardService) {}
}
