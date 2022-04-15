import { DealTokenSwap, ITokenCalculated } from "entities/DealTokenSwap";
import "./status-card.scss";
import { containerless, bindable, computedFrom } from "aurelia-framework";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import { BigNumber } from "ethers";
@containerless
export class StatusCard {
  @bindable deal: DealTokenSwap;
  @bindable dao: IDAO;
  @bindable tokens: ITokenCalculated[];

  @computedFrom("swapCompleted", "dao", "deal.isFailed", "tokens")
  get chipColor(): string{
    if (this.swapCompleted){
      return "success";
    }
    if (this.tokens.every((x: ITokenCalculated) => x.required?.lte(0))){
      return "success";
    } else {
      return this.deal.isFailed ? "danger" : "warning";
    }
  }

  @computedFrom("swapCompleted", "dao", "deal.isFailed", "deal.isClaiming", "tokens")
  get status(): string{
    if (this.swapCompleted){
      return "Swap completed";
    } else if (this.deal.isClaiming){
      if (this.isDaoFullyClaimed){
        return "Claiming Completed";
      }
      return "Claiming in progress";
    }
    if (this.isDaoTargetReached){
      return "Target reached";
    } else {
      return this.deal.isFailed ? "Target not reached" : "Funding in progress";
    }
  }

  @computedFrom("deal.isClaiming", "deal.isFullyClaimed")
  private get swapCompleted() : boolean {
    return this.deal.isClaiming && this.deal.isFullyClaimed;
  }

  @computedFrom("tokens")
  private get isDaoFullyClaimed() : boolean {
    //return true if all tokens for this dao have been claimed
    if (!this.deal.isExecuted) return false;
    return this.tokens.every(x => BigNumber.from(x.amount).eq(x.claimed));
  }

  @computedFrom("tokens")
  private get isDaoTargetReached() : boolean {
    //return true if all tokens for this dao have reached their funding target
    return this.tokens.every(x => BigNumber.from(x.amount).eq(x.deposited));
  }
}
