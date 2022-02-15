import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { WizardService } from "../../../services/WizardService";

import "./stageButtons.scss";

@autoinject
export class stageButtons {
  @bindable wizardManager: any;
  @bindable showSubmit = false;
  validating = false;

  constructor(public wizardService: WizardService) {
  }

  async proceed() {
    this.isLoading= true;
    await this.wizardService.proceed(this.wizardManager).finally(() => this.validating = false);
  }
}
