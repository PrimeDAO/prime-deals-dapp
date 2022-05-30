import { bindable, containerless, IEventAggregator, singleton } from "aurelia";
import { DisposableCollection } from "../../../services/DisposableCollection";
import { Address, IEthereumService } from "../../../services/EthereumService";
import { Utils } from "../../../services/utils";
import { ContractNames, ContractsService } from "../../../services/ContractsService";
import { EventConfigTransaction } from "../../../services/GeneralEvents";
import { TransactionReceipt } from "@ethersproject/providers";

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

  constructor(
    @IEthereumService private ethereumService: IEthereumService,
    @IEventAggregator private eventAggregator: IEventAggregator,
  ) {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account", async (account: Address) => {
      console.log("address changed (does not work) ->", account);
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

  private get txInProgress(): boolean {
    return this.txPhase !== "None";
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
