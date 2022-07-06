import { IDealRegistrationTokenSwap, IProposal } from "entities/DealRegistrationTokenSwap";
import { IContainer, ICustomElementViewModel, IDisposable, IEventAggregator, inject } from "aurelia";
import { IValidationRules } from "@aurelia/validation";
import { IValidationController } from "@aurelia/validation-html";

export class ProposalStage implements ICustomElementViewModel {

  proposal: IProposal = {
    description: "",
    summary: "",
    title: "",
  };
  event: IDisposable;

  constructor(
    @inject("registrationData") private readonly registrationData: IDealRegistrationTokenSwap,
    @IContainer private readonly container: IContainer,
    @IEventAggregator private readonly eventAggregator: IEventAggregator,
    @IValidationController public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,

  ) {
    this.proposal = this.registrationData?.proposal;
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
  }

}
