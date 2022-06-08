import { DealTokenSwap } from "entities/DealTokenSwap";
import { AlertService, IAlertModel, ShowButtonsEnum } from "services/AlertService";
import { Utils } from "services/utils";
import { EventConfig, EventMessageType } from "services/GeneralEvents";
import { bindable, DialogDeactivationStatuses, IEventAggregator } from "aurelia";
import { IRouter } from "@aurelia/router";

export class DealSwapStatus {
  @bindable deal: DealTokenSwap;
  private isExecutingSwap = false;
  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
    private alertService: AlertService,
    @IRouter private readonly router: IRouter,
  ) {
  }
  public async attached() {
    //wait until the dao transactions from the contract are there
    await Utils.waitUntilTrue(() => this.deal.daoTokenTransactions !== undefined);
    //wait until the dao token claims from the contract are there
    await Utils.waitUntilTrue(() => this.deal.daoTokenClaims !== undefined);
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
      message: "<deal-swap-modal deal.bind='data.deal'></deal-swap-modal>", //TODO import modal HTML from deal-swap-modal.html
      buttonTextPrimary: "Execute Swap <i style='margin-left:5px;' class='fa'>&#xf021;</i>",
      buttonTextSecondary: "Cancel",
      buttons: ShowButtonsEnum.Both,
      data: { deal: this.deal },
      className: "executeSwap",
    };

    // show a modal confirming the user wants to execute the swap
    //const dialogResult = await this.alertService.showAlert(swapModal);
    const dialogResult = await this.alertService.showAlert(swapModal);
    if (dialogResult.status !== DialogDeactivationStatuses.Cancel) {
      this.isExecutingSwap = true;
      //the user said they wanted to execute the swap so call the swap contract
      const transactionReceipt = await this.deal.execute();
      if (transactionReceipt) {
        //if the swap succeeded, show the 'congrats' modal
        const congratulatePopupModel: IAlertModel = {
          header: "Congratulations!",
          message: "<p class='excitement'>You have successfully executed the token swap!</p>",
          confetti: true,
          buttonTextPrimary: "Close",
          className: "congratulatePopup",
        };
        this.eventAggregator.publish("deal.executed", true);
        await this.alertService.showAlert(congratulatePopupModel);
      } else {
        this.eventAggregator.publish("handleFailure", new EventConfig("There was an error while attempting to execute the token swap. Please try again later", EventMessageType.Info, "Execute Swap Error"));
      }
      this.isExecutingSwap = false;
    }
  }
}
