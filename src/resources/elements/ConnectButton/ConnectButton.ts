import "./ConnectButton.scss";

import { Address, EthereumService } from "services/EthereumService";
import { ContractNames, ContractsService } from "services/ContractsService";
import { autoinject, containerless, customElement, singleton } from "aurelia-framework";

import { DisposableCollection } from "services/DisposableCollection";
import { EventAggregator } from "aurelia-event-aggregator";
import { EventConfigException, EventConfigTransaction } from "services/GeneralEvents";
import { TransactionReceipt } from "services/TransactionsService";
import { Utils } from "services/utils";
import { bindable } from "aurelia-typed-observable-plugin";

const SAFE_APP_ERROR_CODE = 200;

enum Phase {
  None = "None",
  Mining = "Mining",
  Confirming = "Confirming"
}

@singleton(false)
@containerless
@autoinject
@customElement("connectbutton")
export class ConnectButton {

  @bindable.booleanAttr private hideBalances: boolean;
  @bindable private showWalletMenu?: () => void;

  private subscriptions: DisposableCollection = new DisposableCollection();
  private accountAddress: Address = null;
  private txPhase = Phase.None;
  private txReceipt: TransactionReceipt;
  private primeAddress: Address;
  private disable = false;

  private get txInProgress(): boolean {
    return this.txPhase !== "None";
  }

  constructor(
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ) {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", async (account: Address) => {
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

  /**
   * Disable connect button if
   * - Not a safe address &&
   * - Not an owner of the safe
   */
  async handleSafeAppAccountSetting(account: string): Promise<void> {
    const isMemberOfSafe = await this.ethereumService.isMemberOfSafe(account);

    if (
      account !== null &&
      !(await this.ethereumService.isSafeAddress(account)) &&
      !isMemberOfSafe
    ) {
      this.disable = true;
      this.ethereumService.softDisconnect({code: SAFE_APP_ERROR_CODE, message: "Address not an owner"});
      this.eventAggregator.publish("handleException", new EventConfigException("Unauthorized", "Account is not an owner of the Safe. You will not be able to connect to the Deals Safe App"));
      return;
    } else if (isMemberOfSafe) {
      this.disable = false;
    }

    this.accountAddress = account;
    this.txPhase = Phase.None;
    this.txReceipt = null;
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

  private gotoTx(): void {
    if (this.txReceipt) {
      Utils.goto(this.ethereumService.getEtherscanLink(this.txReceipt.transactionHash, true));
    }
  }
}
