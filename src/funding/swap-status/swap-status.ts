import "./swap-status.scss";
import { containerless, bindable } from "aurelia-framework";
import { DealTokenSwap, ITokenCalculated } from "../../entities/DealTokenSwap";
import { Utils } from "services/utils";
@containerless
export class SwapStatus {
  @bindable deal: DealTokenSwap;
  private firstDaoTokens: ITokenCalculated[];
  private secondDaoTokens: ITokenCalculated[];

  public bind(){
    //clone the DAO's tokens from the deal so we can add contract data to the tokens
    this.firstDaoTokens = Utils.cloneDeep(this.deal.primaryDao.tokens as ITokenCalculated[]);
    this.secondDaoTokens = Utils.cloneDeep(this.deal.partnerDao.tokens as ITokenCalculated[]);
    //loop through each token in the primary DAO and set the contract data on those tokens
    this.firstDaoTokens.forEach(async x => {await this.deal.setTokenContractInfo(x, this.deal.primaryDao);});
    //loop through each token in the partner DAO and set the contract data on those tokens
    this.secondDaoTokens.forEach(async x => {await this.deal.setTokenContractInfo(x, this.deal.partnerDao);});
  }
}
