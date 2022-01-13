import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealWizardService, IWizardConfig } from "../../../services/DealWizardService";
import { IStepperStep } from "dealWizard/dealWizard.types";
import "./dealWizardStepper.scss";

@autoinject
export class DealWizardStepper {
  @bindable wizardManager: any;
  public steps: IStepperStep[];
  public wizard: IWizardConfig;

  constructor(public dealWizardService: DealWizardService) {}

  attached(): void {
    this.wizard = this.dealWizardService.getWizard(this.wizardManager);
    this.steps = this.wizard.stages;
  }

  onClick(index: number): void {
    this.dealWizardService.goToStage(this.wizardManager, index);
  }
}
