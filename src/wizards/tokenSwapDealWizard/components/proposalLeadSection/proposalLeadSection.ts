import { bindable } from "aurelia-typed-observable-plugin";
import { IProposalLead } from "entities/DealRegistrationTokenSwap";
import { WizardErrors } from "wizards/services/WizardService";

export class ProposalLeadSection {
  @bindable errors: WizardErrors<IProposalLead>;
  @bindable data: Record<string, string>;
  @bindable disabled = false;
}
