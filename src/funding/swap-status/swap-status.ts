import { DealStatus } from "entities/IDealTypes";
import "./swap-status.scss";
import { containerless, bindable } from "aurelia-framework";
import { DealTokenSwap } from "../../entities/DealTokenSwap";

@containerless
export class SwapStatus {
  @bindable deal: DealTokenSwap;
  private swapCompleted: boolean;
  private fundingFailed: boolean;
  public bind(){
    this.swapCompleted = this.deal.status === DealStatus.completed;
    this.fundingFailed = this.deal.status === DealStatus.failed;
  }
}
