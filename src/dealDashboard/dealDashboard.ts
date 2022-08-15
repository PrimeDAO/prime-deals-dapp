import { IEthereumService } from "./../services/EthereumService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { IDealService } from "../services/DealService";
import { IRouter, IRouteableComponent } from "@aurelia/router";
import { IEventAggregator, inject } from "aurelia";
import { watch } from "@aurelia/runtime-html";

@inject()
export class DealDashboard implements IRouteableComponent {
  private deal: DealTokenSwap;
  private discussionId: string = null;
  private dealId: string;

  constructor(
    @IEthereumService private ethereumService: IEthereumService,
    @IDealService private dealService: IDealService,
    @IRouter private router: IRouter,
    @IEventAggregator private eventAggregator: IEventAggregator,
  ) {
  }

  private get isAllowedToDiscuss(): boolean {
    return (this.deal?.isUserRepresentativeOrLead) || (!this.deal?.isPartnered && !!this.ethereumService.defaultAccountAddress);
  }

  public async canLoad(params: { id: string }): Promise<boolean> {
    await this.dealService.ensureInitialized();
    this.checkUserCanAccessDashboard(params.id);
    return true;
  }

  public async load(params: { id: string }) {
    /* prettier-ignore */ console.log(">>>> _ >>>> ~ file: dealDashboard.ts ~ line 33 ~ this.dealService.deals", this.dealService.deals);
    this.deal = this.dealService.deals.get(params.id);
    await this.deal.ensureInitialized();
  }

  @watch((x: DealDashboard) => x.dealService.deals)
  public checkUserCanAccessDashboard(dealId: string): void {
    // a deal entity going from public to private will disappear from the deals map
    if (!this.dealService.deals.has(dealId)) {
      this.eventAggregator.publish("handleInfo", "The deal you were viewing has become private");
      this.router.load("home");
    }
  }

}
