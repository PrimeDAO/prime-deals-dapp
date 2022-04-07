import { DealTokenSwap, ITokenCalculated } from "entities/DealTokenSwap";
import "./status-card.scss";
import { containerless, bindable, computedFrom } from "aurelia-framework";
import { IDAO } from "entities/DealRegistrationTokenSwap";
@containerless
export class StatusCard {
  @bindable deal: DealTokenSwap;
  @bindable dao: IDAO;
  @bindable tokens: ITokenCalculated[] | I;

  public bind(){

  }

  @computedFrom("swapCompleted", "dao")
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

  @computedFrom("swapCompleted", "dao")
  get status(): string{
    if (this.swapCompleted){
      return "Swap completed";
    } else if (this.deal.isClaiming){
      //TODO check this dao to see if any tokens aren't fully claimed and return the status text for it
      return "Swapping in completed";
    }
    if (this.tokens.every((x: ITokenCalculated) => x.required?.lte(0))){
      //TODO check this dao to see if any tokens aren't fully funded and return the status text for it
      return "Target reached";
    } else {
      return this.deal.isFailed ? "Target not reached" : "Funding in progress"; //DealStatus.funding; //TODO why is there no status in DealStatus for "Funding in progress"?
    }
  }

  @computedFrom("deal.isClaiming", "deal.isFullyClaimed")
  private get swapCompleted() : boolean {
    return this.deal.isClaiming && this.deal.isFullyClaimed;
  }
}
