import "./swap-status.scss";
import { containerless, bindable } from "aurelia-framework";
import { DealTokenSwap } from "../../entities/DealTokenSwap";
@containerless
export class SwapStatus {
  @bindable deal: DealTokenSwap;

}
