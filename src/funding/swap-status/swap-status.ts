import "./swap-status.scss";
import { containerless, bindable, computedFrom} from "aurelia-framework";
import { DealTokenSwap, ITokenCalculated } from "../../entities/DealTokenSwap";
import { Utils } from "services/utils";
@containerless
export class SwapStatus {
  @bindable deal: DealTokenSwap;

  @computedFrom("deal.daoTokenTransactions")
  private get firstDaoTokens(){
    const firstDaoTokens = Utils.cloneDeep(this.deal.primaryDao.tokens as ITokenCalculated[]);
    firstDaoTokens.forEach(async x => {await this.deal.setTokenContractInfo(x, this.deal.primaryDao);});
    return firstDaoTokens;
  }

  @computedFrom("deal.daoTokenTransactions")
  private get secondDaoTokens(){
    const secondDaoTokens = Utils.cloneDeep(this.deal.partnerDao.tokens as ITokenCalculated[]);
    secondDaoTokens.forEach(async x => {await this.deal.setTokenContractInfo(x, this.deal.partnerDao);});
    return secondDaoTokens;
  }

}
