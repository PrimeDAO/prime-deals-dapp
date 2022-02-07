import { autoinject } from "aurelia-framework";
import { ValidationController } from "aurelia-validation";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap } from "../../../entities/DealRegistrationTokenSwap";
import { IStageMeta, WizardType } from "../../dealWizardTypes";

@autoinject
export class LeadDetailsStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  proposalLeadForm: ValidationController;
  isOpenProposalPage = false;

  constructor(public wizardService: WizardService) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.isOpenProposalPage = stageMeta.wizardType === WizardType.openProposal;
  }

  attached(): void {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    this.wizardService.registerStageValidateFunction(this.wizardManager, async () => {
      return this.proposalLeadForm.validate().then(result => result.valid);
    });
  }
}
