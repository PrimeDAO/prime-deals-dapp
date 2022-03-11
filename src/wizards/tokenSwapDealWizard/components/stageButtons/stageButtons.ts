import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { IDealRegistrationTokenSwap } from "entities/DealRegistrationTokenSwap";
import { ConsoleLogService } from "services/ConsoleLogService";
import { Address, EthereumService } from "services/EthereumService";
import { IWizardState, WizardService } from "../../../services/WizardService";

import "./stageButtons.scss";

@autoinject
export class stageButtons {
  @bindable wizardManager: any;
  @bindable showSubmit;
  @bindable onSubmit: () => void;

  private wizardState: IWizardState<IDealRegistrationTokenSwap>;
  private accountSubscription: Subscription;

  validating = false;
  connectedAddress?: Address;

  constructor(
    public wizardService: WizardService,
    private consoleLogService: ConsoleLogService,
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService,
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
    this.accountSubscription = this.eventAggregator.subscribe("Network.Changed.Account", address => {
      this.connectedAddress = address;
    });
  }

  detached() {
    this.accountSubscription.dispose();
  }

  connectToWallet() {
    this.ethereumService.ensureConnected();
  }

  showSubmitButton() {
    const lastStageIndex = this.wizardState.stages.length - 1;
    const currentStageIndex = this.wizardState.indexOfActive;
    const isLastStage = lastStageIndex === currentStageIndex;

    return isLastStage;
  }
}
