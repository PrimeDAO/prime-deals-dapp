import {autoinject} from "aurelia-framework";
import {Router} from "aurelia-router";
import {bindable} from "aurelia-typed-observable-plugin";
import {Address} from "services/EthereumService";
import { IDeal } from "entities/IDealTypes";
import "./dealSummary.scss";

/**
 * Is used as the <deal-summary /> component in the deals page
 * This displays the cards that are in the horizontal scroller
 */
@autoinject
export class DealSummary {

  @bindable public address: Address;
  @bindable public deal: IDeal;
  @bindable public logo: string;
  @bindable public name: string;
  public loading = true;
  public container: HTMLElement;

  constructor(
    private router: Router,
  ) {}

  public async attached(): Promise<void> {
    this.loading = false;
  }

  /**
   * Navigates user to the deal page by id
   */
  public navigate(): void {
    this.router.navigate("deal/" + this.deal.id);
  }

}
