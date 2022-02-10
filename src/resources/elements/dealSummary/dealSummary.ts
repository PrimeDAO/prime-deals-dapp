import {autoinject} from "aurelia-framework";
import {Router} from "aurelia-router";
import {bindable} from "aurelia-typed-observable-plugin";
import {Address} from "services/EthereumService";
import { IDeal } from "entities/IDealTypes";
import "./dealSummary.scss";

@autoinject
export class DealSummary {

  @bindable address: Address;
  @bindable name: string;
  @bindable logo: string;
  @bindable deal: IDeal;
  loading = true;
  container: HTMLElement;

  constructor(
    private router: Router,
  ) {}

  async attached(): Promise<void> {
    this.loading = false;
  }

  navigate(): void {
    this.router.navigate("deal/" + this.deal.id);
  }
}
