import { DisposableCollection } from "services/DisposableCollection";
import { EthereumService, IEthereumService } from "services/EthereumService";
import { BigNumber } from "ethers";
import { bindable, containerless, IEventAggregator } from "aurelia";

@containerless
export class EthBalance {
  @bindable public placement = "top";

  private balance: BigNumber = null;
  private subscriptions = new DisposableCollection();
  private checking = false;
  private account: string;

  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IEthereumService private ethereumService: IEthereumService,
  ) {
  }

  public attaching(): void {
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Account",
      (account: string) => {
        this.account = account;
        this.getBalance();
      }));
    this.subscriptions.push(this.eventAggregator.subscribe("Network.Changed.Id",
      () => {
        this.initialize();
      }));
    this.subscriptions.push(this.eventAggregator.subscribe("Network.NewBlock",
      () => this.getBalance()));
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.account = this.ethereumService.defaultAccountAddress;
    this.getBalance();
  }

  private detaching(): void {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
  }

  private async getBalance() {
    if (!this.checking) {
      try {
        this.checking = true;
        if (this.account) {
          const provider = this.ethereumService.readOnlyProvider;
          this.balance = await provider.getBalance(this.account);
        } else {
          this.balance = null;
        }
      } catch (ex) {
        console.error(ex);
      } finally {
        this.checking = false;
      }
    }
  }
}
