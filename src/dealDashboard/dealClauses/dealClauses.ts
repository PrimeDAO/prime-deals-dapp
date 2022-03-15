import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealClauses.scss";

@autoinject
export class DealClauses {
  @bindable deal: DealTokenSwap;
  @bindable.booleanAttr authorized = false;
}
