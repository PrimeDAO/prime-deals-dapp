import { DealTokenSwap, ITokenCalculated } from "entities/DealTokenSwap";
import "./status-card.scss";
import { deepComputedFrom } from "aurelia-deep-computed";
import { containerless, bindable, computedFrom } from "aurelia-framework";
import { BigNumber } from "ethers";
import { IDAO } from "entities/DealRegistrationTokenSwap";
@containerless
export class StatusCard {
  @bindable deal: DealTokenSwap;
  @bindable isPrimary: boolean;

  @computedFrom("swapCompleted", "deal.isFailed", "tokenDao.tokens")
  get chipColor(): string{
    const test = this.isDaoFullyClaimed;
    if (this.swapCompleted || test){
      return "success";
    }
    if (this.tokenDao.tokens.every((x: ITokenCalculated) => x.fundingRequired?.lte(0))){
      return "success";
    } else {
      return this.deal.isFailed ? "danger" : "warning";
    }
  }

  @computedFrom("swapCompleted", "deal.isFailed", "deal.isClaiming", "tokenDao.tokens")
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

  @computedFrom("tokenDao.tokens")
  private get isDaoFullyClaimed() : boolean {
    //return true if all tokens for this dao have been claimed
    if (!this.deal.isExecuted) return false;
    return (this.tokenDao.tokens as ITokenCalculated[]).every(x => BigNumber.from(x.amount).eq(x.claimingClaimed?.add(x.instantTransferAmount) ?? 0));
  }

  @computedFrom("tokenDao.tokens")
  private get isDaoTargetReached() : boolean {
    //return true if all tokens for this dao have reached their funding target
    return (this.tokenDao.tokens as ITokenCalculated[]).every(x => BigNumber.from(x.amount).eq(x.fundingDeposited ?? 0));
  }

  private getTotalClaimed(claimingClaimed: ITokenCalculated["claimingClaimed"], instantTransferAmount: ITokenCalculated["instantTransferAmount"]): BigNumber{
    return claimingClaimed?.add(BigNumber.from(instantTransferAmount));
  }

  @computedFrom("deal", "isPrimary")
  private get firstDao(): IDAO{
    return this.isPrimary ? this.deal.primaryDao : this.deal.partnerDao;
  }

  @computedFrom("deal", "isPrimary")
  private get tokenDao(): IDAO {
    if (this.deal.isExecuted){
      if (this.isPrimary){
        return this.deal.partnerDao;
      } else {
        return this.deal.primaryDao;
      }
    } else {
      if (this.isPrimary){
        return this.deal.primaryDao;
      } else {
        return this.deal.partnerDao;
      }
    }
  }
}
