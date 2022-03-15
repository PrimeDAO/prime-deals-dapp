import { autoinject, bindable } from "aurelia-framework";
import { DealTokenSwap } from "entities/DealTokenSwap";
import "./dealMenubar.scss";

@autoinject
export class DealMenubar {
  @bindable deal: DealTokenSwap;

}
