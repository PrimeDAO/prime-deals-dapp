import { Router, bindable } from "aurelia";
import { Address } from "services/EthereumService";
import "./dealSummary.scss";
import { DealTokenSwap } from "../../entities/DealTokenSwap";

/**
 * Is used as the <deal-summary /> component in the deals page
 * This displays the cards that are in the horizontal scroller
 */
export class DealSummary {

  @bindable public address: Address;
  @bindable public deal: DealTokenSwap;
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
    this.router.load("deal/" + this.deal.id);
  }

  get dealSummary() {
    let visibleSummary = this.deal.registrationData.proposal.summary.substring(0, 160);
    if (visibleSummary.length < this.deal.registrationData.proposal.summary.length) {
      visibleSummary += "...";
    }
    return visibleSummary;
  }

}
