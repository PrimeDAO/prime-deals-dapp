import { DealService } from "services/DealService";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Address, IEthereumService } from "services/EthereumService";
import { IWizardState, WizardService } from "../../../services/WizardService";
import { bindable, IDisposable, IEventAggregator, inject } from "aurelia";

@inject()
export class stageButtons {
  @bindable wizardManager: any;
  @bindable showSubmit;
  @bindable onSubmit: () => void;
  validating = false;
  connectedAddress?: Address;
  private wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private accountSubscription: IDisposable;

  constructor(
    public wizardService: WizardService,
    private consoleLogService: ConsoleLogService,
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IEthereumService private ethereumService: IEthereumService,
    @IDataSourceDeals private dataSourceDeals: IDataSourceDeals,
    private dealService: DealService,
  ) {
  }

  async proceed() {
    this.validating = true;
    this.wizardService
      .proceed(this.wizardManager)
      .catch(errorMessage => this.consoleLogService.logMessage(errorMessage, "error"))
      .finally(() => this.validating = false);
  }

  attached() {
    this.wizardState = this.wizardService.getWizardState(this.wizardManager);

    if (this.showSubmit === undefined) {
      this.showSubmit = this.showSubmitButton();
    }

    this.connectedAddress = this.ethereumService.defaultAccountAddress;
    this.accountSubscription = this.eventAggregator.subscribe("Network.Changed.Account", (address: string) => {
      this.connectedAddress = address;
    });
  }

  detached() {
    this.accountSubscription.dispose();
  }

  connectToWallet() {
    this.ethereumService.ensureConnected();
  }

  async authenticate() {
    await this.dealService.loadDeals();
  }

  showSubmitButton() {
    const lastStageIndex = this.wizardState?.stages.length - 1;
    const currentStageIndex = this.wizardState?.indexOfActive;
    const isLastStage = lastStageIndex === currentStageIndex;

    return isLastStage;
  }
}
