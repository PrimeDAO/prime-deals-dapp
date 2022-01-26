import { bindable } from "aurelia-typed-observable-plugin";

export class ProposalLeadSection {
  @bindable errors: Record<string, string> = {};
  @bindable data: Record<string, string>;
  @bindable disabled = false;
}
