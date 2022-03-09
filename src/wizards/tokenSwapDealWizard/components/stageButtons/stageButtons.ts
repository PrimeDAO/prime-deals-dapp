import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { ConsoleLogService } from "services/ConsoleLogService";
import { IWizardState, WizardService } from "../../../services/WizardService";

import "./stageButtons.scss";

@autoinject
export class stageButtons {
  @bindable wizardManager: any;
  @bindable showSubmit;
  @bindable onSubmit: () => void;

  private wizardState: IWizardState<IDealRegistrationTokenSwap>;

  validating = false;

  constructor(
    public wizardService: WizardService,
    private consoleLogService: ConsoleLogService,
  ) {
  }

  async proceed() {
    this.validating = true;
    this.wizardService
      .proceed(this.wizardManager)
      .catch(errorMessage => this.consoleLogService.logMessage(errorMessage, "error"))
      .finally(() => this.validating = false);
  }

  attached() {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    if (this.showSubmit === undefined) {
      this.showSubmit = this.showSubmitButton();
    }
  }

  showSubmitButton() {
    const lastStageIndex = this.wizardState.stages.length - 1;
    const currentStageIndex = this.wizardState.indexOfActive;
    const isLastStage = lastStageIndex === currentStageIndex;

    return isLastStage;
  }
}
