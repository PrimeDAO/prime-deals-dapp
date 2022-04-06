import { autoinject, computedFrom } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { DealService } from "../services/DealService";
import "./dealDashboard.scss";
import { EventAggregator } from "aurelia-event-aggregator";
import { Router } from "aurelia-router";
import { AureliaHelperService } from "../services/AureliaHelperService";
import { DisposableCollection } from "../services/DisposableCollection";
import { AlertService, IAlertModel, ShowButtonsEnum } from "services/AlertService";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import { Utils } from "services/utils";
import { EventConfig, EventMessageType } from "services/GeneralEvents";

@autoinject
export class DealDashboard {
  private deal: DealTokenSwap;
  private discussionId: string = null;
  private dealId: string;
  private subscriptions = new DisposableCollection();
  private isExecutingSwap = false;
  constructor(
    private ethereumService: EthereumService,
    private dealService: DealService,
    private eventAggregator: EventAggregator,
    private router: Router,
    private aureliaHelperService: AureliaHelperService,
    private alertService: AlertService,
  ) {
  }

  @computedFrom("deal.isUserRepresentativeOrLead", "deal.isPrivate", "ethereumService.defaultAccount")
  private get isAllowedToDiscuss(): boolean {
    return (this.deal.isUserRepresentativeOrLead) || (!this.deal.isPartnered && !!this.ethereumService.defaultAccountAddress);
  }

  public async canActivate(params: { address: string }): Promise<boolean> {
    await this.dealService.ensureInitialized();
    this.deal = this.dealService.deals.get(params.address);
    await this.deal.ensureInitialized();
    return this.userCanAccessDashboard;
  }

  public activate() {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", () => {
      if (!this.userCanAccessDashboard) {
        this.router.navigate("home");
      }
    }));

    this.subscriptions.push(
      this.aureliaHelperService.createPropertyWatch(this.deal, "isPrivate", async (value: boolean) => {
        await this.deal.setPrivacy(value).catch(() => {
          this.eventAggregator.publish("handleFailure", "Sorry, an error occurred");
        });
        this.eventAggregator.publish("showMessage", "Deal privacy has been successfully submitted");
      }),
    );
  }

  public detached() {
    this.subscriptions.dispose();
  }

  public get userCanAccessDashboard(): boolean {
    return !this.deal.isPrivate || this.deal.isRepresentativeUser || this.deal.isUserProposalLead;
  }

  /**
   * Executes the token swap. Called by the "Execute Token Swap" button on the UI
   *  - pops up a modal to verify the user wants to execute the swap
   *  - does nothing if they hit cancel
   *  - if they hit "execute" it will execute and show the congrats modal
   */
  public async executeSwap(): Promise<void> {
    const swapModal: IAlertModel = {
      header: "Execute token swap",
      message:
        `<p>You are about to execute token swapping between the following two DAOs. Do you want to execute these swaps?</p>
        <div class='modal-content'>${this.getDaoHtmlForSwap(this.deal.primaryDao)}${this.getDaoHtmlForSwap(this.deal.partnerDao)}</div>`,
      buttonTextPrimary: "Execute Swap <i style='margin-left:5px;' class='fa'>&#xf021;</i>",
      buttonTextSecondary: "Cancel",
      buttons: ShowButtonsEnum.Both,
      className: "executeSwap",
    };
    // show a modal confirming the user wants to execute the swap
    const dialogResult = await this.alertService.showAlert(swapModal);
    if (!dialogResult.wasCancelled) {
      this.isExecutingSwap = true;
      //the user said they wanted to execute the swap so call the swap contract
      const transactionReceipt = await this.deal.execute();
      if (transactionReceipt){
        //if the swap succeeded, show the 'congrats' modal
        const congratulatePopupModel: IAlertModel = {
          header: "Congratulations!",
          message: "<p class='excitement'>You have successfully executed the token swap!</p>",
          confetti: true,
          buttonTextPrimary: "Close",
          className: "congratulatePopup",
        };
        await this.alertService.showAlert(congratulatePopupModel);
      } else {
        this.eventAggregator.publish("handleError", new EventConfig("There was an error while attempting to execute the token swap. Please try again later", EventMessageType.Info, "Execute Swap Error"));
      }
      this.isExecutingSwap = false;
    }
  }

  /**
   * Gets the HTML for the dao token swap modal popup
   * @param dao
   * @returns string
   */
  private getDaoHtmlForSwap(dao: IDAO): string {
    return `
      <div>
        <h6>${dao.name} treasury address</h6>
        <div class="dao">
          <address-link address="${dao.treasury_address}"
              link-text="${dao.treasury_address}"
              show-arrow-inside-link.bind="true"
              show-tooltip.bind="false">
            </address-link>
        </div>
      </div>
      `;
  }

  /**
   * Opens a new window to the transaction id or address on the blockchain
   * @param address
   * @param tx
   */
  private gotoEtherscan = (address: string, tx = false): void => {
    Utils.goto(this.ethereumService.getEtherscanLink(address, tx));
  };
}
