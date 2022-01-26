import { bindable } from "aurelia-typed-observable-plugin";
import { IProposalLeadStageErrors } from "../../../services/WizardValidationService";

export class ProposalLeadSection {
  @bindable errors: IProposalLeadStageErrors;
  @bindable data: Record<string, string>;
  @bindable disabled = false;
}
