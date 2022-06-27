import { inject } from "aurelia";

@inject()
export class ProposalStage {
  // public wizardManager: any;
  // public wizardState: IWizardState<IDealRegistrationTokenSwap>;
  //
  // proposal: IProposal;

  // constructor(
  //   public wizardService: WizardService,
  //   @newInstanceForScope(IValidationController) public form: IValidationController,
  //   @IValidationRules private validationRules: IValidationRules,
  // ) {
  // }

  // load(): void {
  //   this.wizardManager = this.wizardService.currentWizard;
  //   this.wizardState = this.wizardService.getWizardState(this.wizardManager);
  //   this.proposal = this.wizardState.registrationData.proposal;
  //
  //   this.validationRules
  //     .on(this.proposal)
  //     .ensure("title")
  //     .required()
  //     .ensure("summary")
  //     .required()
  //     .minLength(10)
  //     .ensure("description")
  //     .required()
  //     .minLength(10);
  //
  //   this.wizardService.registerForm(
  //     this.wizardManager,
  //     this.form,
  //   );
  // }
}
