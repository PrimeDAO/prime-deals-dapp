import { IBaseWizardStage, IStageMeta } from "../../dealWizardTypes";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { IDealRegistrationTokenSwap, IProposal } from "entities/DealRegistrationTokenSwap";
import { inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { IValidationRules } from "@aurelia/validation";

@inject()
export class ProposalStage implements IBaseWizardStage {
  public wizardManager: any;
  public wizardState: IWizardState<IDealRegistrationTokenSwap>;

  proposal: IProposal;

  constructor(
    public wizardService: WizardService,
    @IValidationController private form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
  ) {
  }

  activate(stageMeta: IStageMeta): void {
    this.wizardManager = stageMeta.wizardManager;
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);
    this.proposal = this.wizardState.registrationData.proposal;

    this.validationRules
      .on(this.proposal)
      .ensure("title")
      .required()
      .ensure("summary")
      .required()
      .minLength(10)
      .ensure("description")
      .required()
      .minLength(10);

    // this.form = this.wizardService.registerValidationRules(
    //   this.wizardManager,
    //   this.wizardState.registrationData.proposal,
    //   // validationRules,
    //   [],
    // );
  }

  async submit() {
    const results = await this.form.validate();
    console.log("resu ->", results);
  }
}
