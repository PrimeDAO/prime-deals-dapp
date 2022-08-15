import { IDealService } from "services/DealService";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Address, IEthereumService } from "services/EthereumService";
import { bindable, IDisposable, IEventAggregator, inject } from "aurelia";
import { IRouter } from "@aurelia/router";

@inject()
export class stageButtons {
  @bindable showSubmit;
  @bindable onSubmit: () => void;
  @bindable currentIndex = 0;
  @bindable stageCount = 0;
  @bindable proceed: () => void;
  @bindable previous: () => void;
  connectedAddress?: Address;
  private accountSubscription: IDisposable;

  constructor(
    private consoleLogService: ConsoleLogService,
    @IRouter private router: IRouter,
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IEthereumService private ethereumService: IEthereumService,
    @IDataSourceDeals private dataSourceDeals: IDataSourceDeals,
    @IDealService private dealService: IDealService,
  ) {
  }

  attached() {
    if (this.showSubmit === undefined) {
      this.showSubmit = this.showSubmitButton();
    }

    this.connectedAddress = this.ethereumService.defaultAccountAddress;
    this.accountSubscription = this.eventAggregator.subscribe("Network.Changed.Account", (address: string) => {
      this.connectedAddress = address;
    });
  }

  detaching() {
    this.accountSubscription.dispose();
  }

  connectToWallet() {
    this.ethereumService.ensureConnected();
  }

  async authenticate() {
    await this.dealService.loadDeals();
  }

  showSubmitButton() {
    const isLastStage = this.currentIndex === this.stageCount - 1;

    return isLastStage;
  }

  currentIndexChanged(){
    this.showSubmit = this.showSubmitButton();
  }

  cancel() {
    this.router.load("");
  }
}
