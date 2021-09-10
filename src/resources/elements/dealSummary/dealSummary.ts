import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { bindable } from "aurelia-typed-observable-plugin";
// import { Deal } from "entities/Deal";
// import { DealService } from "services/DealService";
import { Address } from "services/EthereumService";
import "./dealSummary.scss";

@autoinject
export class DealSummary {

  @bindable address: Address;
  @bindable name: string;
  @bindable logo: string;
  @bindable deal: any;
  // deal: Deal;
  loading = true;
  container: HTMLElement;

  constructor(
    private router: Router,
    // private dealService: DealService,
  ) {}

  async attached(): Promise<void> {
    // await this.dealService.ensureInitialized();
    // this.deal = this.dealService.deals.get(this.address);
    this.loading = false;
  }

  navigate(href: string): void {
    this.router.navigate(href);
  }

}
