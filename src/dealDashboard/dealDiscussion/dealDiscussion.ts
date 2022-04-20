import { autoinject, bindingMode, computedFrom } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { IClause } from "entities/DealRegistrationTokenSwap";
import "./dealDiscussion.scss";

@autoinject
export class DealDiscussion {
  @bindable deal: DealTokenSwap;
  @bindable.booleanAttr authorized = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) discussionId?: string;

  @computedFrom("deal.registrationData.terms.clauses.length")
  private get clauses(): Map<string, IClause> {
    return new Map<string, IClause>(this.deal.registrationData.terms.clauses.map(clause => [clause.id, clause]));
  }
}
