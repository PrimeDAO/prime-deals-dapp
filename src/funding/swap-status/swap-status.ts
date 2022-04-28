import { EventAggregator } from "aurelia-event-aggregator";
import "./swap-status.scss";
import { containerless, bindable} from "aurelia-framework";
import { DealTokenSwap } from "../../entities/DealTokenSwap";
@containerless
export class SwapStatus {
  @bindable deal: DealTokenSwap;
  private contractDataLoaded = false;
  constructor(
    private eventAggregator: EventAggregator,
  ){}
  public async bind(): Promise<void> {
    await this.initializeData();
    this.eventAggregator.subscribe("deal.executed", (): void => {
      this.initializeData();
    });
  }
  private async initializeData() : Promise<void>{
    await this.deal.ensureInitialized();
    await this.deal.hydrateDaoTransactions();
    if (!this.deal.isClaiming){
      await Promise.all(
        [
          ...this.deal.primaryDao.tokens.map(x => this.deal.setFundingContractInfo(x, this.deal.primaryDao)),
          ...this.deal.partnerDao.tokens.map(x => this.deal.setFundingContractInfo(x, this.deal.partnerDao)),
        ]);
    } else {
      await Promise.all(
        [
          ...this.deal.primaryDao.tokens.map(x => this.deal.setClaimingContractInfo(x, this.deal.partnerDao)),
          ...this.deal.partnerDao.tokens.map(x => this.deal.setClaimingContractInfo(x, this.deal.primaryDao)),
        ]);
    }
    this.contractDataLoaded = true;
  }

}
