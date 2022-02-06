import { autoinject } from "aurelia-framework";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IBaseWizardStage, IStageMeta } from "../../dealWizardTypes";
import { IDealRegistrationTokenSwap } from "../../../entities/DealRegistrationTokenSwap";
import { ValidationController } from "aurelia-validation";

@autoinject
export class PartneredDealProposalLeadStage implements IBaseWizardStage {
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
