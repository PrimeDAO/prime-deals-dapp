import { ITokenFunding } from "entities/TokenFunding";
import { DealStatus } from "entities/IDealTypes";
import "./swap-status.scss";
import { containerless, bindable } from "aurelia-framework";
import { DealTokenSwap } from "../../entities/DealTokenSwap";
import { Utils } from "services/utils";
@containerless
export class SwapStatus {
  @bindable deal: DealTokenSwap;
  private firstDaoTokens: ITokenFunding[];
  private secondDaoTokens: ITokenFunding[];
  private swapCompleted: boolean;
  private fundingFailed: boolean;

  public bind(){
    //clone the DAO's tokens from the deal so we can add contract data to the tokens
    this.firstDaoTokens = Utils.cloneDeep(this.deal.primaryDao.tokens);
    this.secondDaoTokens = Utils.cloneDeep(this.deal.partnerDao.tokens);
    //loop through each token in the primary DAO and set the contract data on those tokens
    this.firstDaoTokens.forEach(x => {this.deal.setTokenContractInfo(x, this.deal.primaryDao);});
    //loop through each token in the partner DAO and set the contract data on those tokens
    this.secondDaoTokens.forEach(x => {this.deal.setTokenContractInfo(x, this.deal.partnerDao);});

    this.swapCompleted = this.deal.status === DealStatus.completed;
    this.fundingFailed = this.deal.status === DealStatus.failed;
  }
}
