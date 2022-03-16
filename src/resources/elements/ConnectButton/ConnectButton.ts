import "./ConnectButton.scss";

import { Address, EthereumService } from "services/EthereumService";
import { ContractNames, ContractsService } from "services/ContractsService";
import { autoinject, containerless, customElement, singleton } from "aurelia-framework";

import { DisposableCollection } from "services/DisposableCollection";
import { EventAggregator } from "aurelia-event-aggregator";
import { EventConfigTransaction } from "services/GeneralEvents";
import { TransactionReceipt } from "services/TransactionsService";
import { Utils } from "services/utils";
import { bindable } from "aurelia-typed-observable-plugin";

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

  private get txInProgress(): boolean {
    return this.txPhase !== "None";
  }

  constructor(
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
  ) {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", async (account: Address) => {
      this.accountAddress = account;
      this.txPhase = Phase.None;
      this.txReceipt = null;
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
