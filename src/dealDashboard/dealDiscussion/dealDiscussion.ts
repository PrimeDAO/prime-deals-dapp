import { DealTokenSwap } from "entities/DealTokenSwap";
import { IClause } from "entities/DealRegistrationTokenSwap";
import { bindable, BindingMode } from "aurelia";
import { toBoolean } from "resources/binding-behaviours";

export class DealDiscussion {
  @bindable deal: DealTokenSwap;
  @bindable({set: toBoolean, type: Boolean}) authorized = false;
  @bindable({mode: BindingMode.twoWay}) discussionId?: string;

  private get clauses(): Map<string, IClause> {
    return new Map<string, IClause>(this.deal.registrationData.terms.clauses.map(clause => [clause.id, clause]));
  }
}
