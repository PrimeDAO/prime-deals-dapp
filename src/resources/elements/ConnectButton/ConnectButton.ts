import { bindable, containerless, IEventAggregator, singleton } from "aurelia";
import { DisposableCollection } from "../../../services/DisposableCollection";
import { Address, IEthereumService } from "../../../services/EthereumService";
import { Utils } from "../../../services/utils";
import { ContractNames, ContractsService } from "../../../services/ContractsService";
import { EventConfigException, EventConfigTransaction } from "../../../services/GeneralEvents";
import { TransactionReceipt } from "@ethersproject/providers";

/**
 * TODO: Should have constants like this in one place
 */
const SAFE_APP_ERROR_CODE = 200;
const SAFE_APP_CHANGE_EVENT_TIMEOUT = 1000;
const SAFE_APP_ERROR_TEXT = "The Account you are trying to connect to the Deals Safe App is not listed as an owner of the Safe.";

enum Phase {
  None = "None",
  Mining = "Mining",
  Confirming = "Confirming"
}

// @singleton causes this component to not be loaded properly
@containerless
export class ConnectButton {

  @bindable private hideBalances: boolean; //@bindable.booleanAttr private hideBalances: boolean;
  @bindable private showWalletMenu?: () => void;

  private subscriptions: DisposableCollection = new DisposableCollection();
  private accountAddress: Address = null;
  private txPhase = Phase.None;
  private txReceipt: TransactionReceipt;
  private primeAddress: Address;
  private isSafeApp: boolean;

  private get txInProgress(): boolean {
    return this.txPhase !== "None";
  }

  constructor(
    @IEthereumService private ethereumService: IEthereumService,
    @IEventAggregator private eventAggregator: IEventAggregator,
  ) {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", async (account: Address) => {
      console.log("address changed (does not work) ->", account);
      if (!await this.ethereumService.isSafeApp()) {
        this.accountAddress = account;
        this.txPhase = Phase.None;
        this.txReceipt = null;
        return;
      }

      await this.handleSafeAppAccountSetting(account);
    }));

    this.subscriptions.push(this.eventAggregator.subscribe("transaction.sent", async () => {
      this.txPhase = Phase.Mining;
      this.txReceipt = null;
    }));

    this.subscriptions.push(this.eventAggregator.subscribe("transaction.mined", async (event: EventConfigTransaction) => {
      this.txPhase = Phase.Confirming;
      this.txReceipt = event.receipt;
    }));

    this.subscriptions.push(this.eventAggregator.subscribe("transaction.confirmed", async () => {
      this.txPhase = Phase.None;
      this.txReceipt = null;
    }));

    this.subscriptions.push(this.eventAggregator.subscribe("transaction.failed", async () => {
      this.txPhase = Phase.None;
      this.txReceipt = null;
    }));

    this.accountAddress = this.ethereumService.defaultAccountAddress || null;
    this.primeAddress = ContractsService.getContractAddress(ContractNames.PRIME);
  }

  async attached() {
    this.isSafeApp = await this.ethereumService.isSafeApp();
  }

  /**
   * Handle following cases
   * - is wrong network?
   * - is read only safe?
   */
  async handleSafeAppAccountSetting(account: string): Promise<void> {
    if (account === null) {
      this.accountAddress = account;
      this.txPhase = Phase.None;
      this.txReceipt = null;
      return;
    }

    /**
     * When we change the network, we need to wait for gnosis safe to update their `readOnly` status as well.
     * This is just some magic value to make it work for the MPV.
     */
    window.setTimeout(async () => {
      const isReadOnlySafe = await this.ethereumService.isReadOnlySafe();

      if (isReadOnlySafe && await this.ethereumService.isWrongNetwork()) {
        await this.ethereumService.handleWrongNetwork();
        return;
      } else if (isReadOnlySafe) {
        this.ethereumService.softDisconnect({code: SAFE_APP_ERROR_CODE, message: "Address not an owner"});
        this.eventAggregator.publish("handleException", new EventConfigException("Unauthorized", SAFE_APP_ERROR_TEXT));
        return;
      }

      this.accountAddress = account;
      this.txPhase = Phase.None;
      this.txReceipt = null;
    }, SAFE_APP_CHANGE_EVENT_TIMEOUT);
  }

  public dispose(): void {
    this.subscriptions.dispose();
  }

  private onConnect(): void {
    if (!this.accountAddress) {
      this.ethereumService.ensureConnected();
    } else if (this.txInProgress) {
      this.gotoTx();
    } else {
      if (this.showWalletMenu) {
        this.showWalletMenu();
      }
    }
  }

  private async connectToSafe(): Promise<void> {
    if (await this.ethereumService.isWrongNetwork()) {
      await this.ethereumService.handleWrongNetwork();
      return;
    } else if (await this.ethereumService.isReadOnlySafe()) {
      this.eventAggregator.publish("handleException", new EventConfigException("Unauthorized", SAFE_APP_ERROR_TEXT));
      return;
    }

    await this.ethereumService.connectToSafeProvider();
  }

  private gotoTx(): void {
    if (this.txReceipt) {
      Utils.goto(this.ethereumService.getEtherscanLink(this.txReceipt.transactionHash, true));
    }
  }
}
