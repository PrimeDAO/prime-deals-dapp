import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealDescription.scss";

@autoinject
export class DealDescription {
  @bindable deal: DealTokenSwap;
}
