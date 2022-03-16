import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealInfo.scss";

@autoinject
export class DealInfo {
  @bindable deal: DealTokenSwap;

}
