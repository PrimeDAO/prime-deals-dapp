import { IStageMeta } from "./../../dealWizardTypes";
import { autoinject } from "aurelia-framework";
import { IBaseWizardStage } from "../../dealWizardTypes";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { ValidationController } from "aurelia-validation";

@autoinject
export class OpenProposalProposalLeadStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  proposalLeadForm: ValidationController;

  constructor(public wizardService: WizardService) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.wizardService.registerStageValidateFunction(this.wizardManager, async () => {
      return this.proposalLeadForm.validate().then(result => result.valid);
    });
  }
}
