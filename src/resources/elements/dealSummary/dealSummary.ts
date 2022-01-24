import {autoinject} from "aurelia-framework";
import {Router} from "aurelia-router";
import {bindable} from "aurelia-typed-observable-plugin";
import {Address} from "services/EthereumService";
import "./dealSummary.scss";
import {IDummyDeal} from "../../../entities/IDummyDeal";

@autoinject
export class DealSummary {

  @bindable address: Address;
  @bindable name: string;
  @bindable logo: string;
  @bindable deal: IDummyDeal;
  loading = true;
  container: HTMLElement;

  constructor(
    private router: Router,
  ) {}

  async attached(): Promise<void> {
    this.loading = false;
  }

  navigate(href: string): void {
    this.router.navigate(href);
  }
}
