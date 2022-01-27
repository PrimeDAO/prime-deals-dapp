import { bindable } from "aurelia-typed-observable-plugin";
import { IProposalLead } from "entities/Deal";
import { WizardErrors } from "services/WizardService";

export class ProposalLeadSection {
  @bindable errors: WizardErrors<IProposalLead>;
  @bindable data: Record<string, string>;
  @bindable disabled = false;
}
