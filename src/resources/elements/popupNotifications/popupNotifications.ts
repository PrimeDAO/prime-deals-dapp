import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, containerless } from "aurelia-framework";
import { EventConfig, EventConfigException, EventConfigTransaction, EventMessageType } from "../../../services/GeneralEvents";
import { from, Subject } from "rxjs";
import { concatMap } from "rxjs/operators";
import { AureliaHelperService } from "services/AureliaHelperService";
import { DisposableCollection } from "services/DisposableCollection";
import "./popupNotifications.scss";

@containerless
@autoinject
export class PopupNotifications {

  private resolveToClose: () => void;
  private showing = false;
  private body: HTMLElement;
  private subbody: HTMLElement;
  private subscriptions: DisposableCollection = new DisposableCollection();
  private queue: Subject<IBannerConfig>;
  private type: EventMessageType;
  private message: string;
  private submessage: string;

  constructor(
    eventAggregator: EventAggregator,
    private aureliaHelperService: AureliaHelperService,
  ) {
    this.subscriptions.push(eventAggregator
      .subscribe("handleException", (config: EventConfigException | any) => this.handleException(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleFailure", (config: EventConfig | string) => this.handleFailure(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleWarning", (config: EventConfig | string) => this.handleWarning(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleValidationError", (config: EventConfig | string) => this.handleValidationError(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("handleInfo", (config: EventConfig | string) => this.handleInfo(config)));
    this.subscriptions.push(eventAggregator
      .subscribe("showMessage", (config: EventConfig | string) => this.handleInfo(config)));

    this.subscriptions.push(eventAggregator.subscribe("transaction.failed", (ex) => this.handleException(ex)));
    this.subscriptions.push(eventAggregator.subscribe("transaction.confirmed", (config: EventConfigTransaction) => this.handleTransaction(config)));

    this.queue = new Subject<IBannerConfig>();
    /**
     * messages added to the queue will show up here, generating a new queue
     * of observables whose values don't resolve until they are observed
     */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    this.queue.pipe(concatMap((config: IBannerConfig) => {
      return from(new Promise((resolve: (value: unknown) => void) => {
        // with timeout, give a cleaner buffer in between consecutive snacks
        setTimeout(() => this.showNotification(config, () => resolve(0)), 200);
      }));
    }))
      // this will initiate the execution of the promises
      // each promise is executed after the previous one has resolved
      .subscribe();
  }

  private async showNotification(config: IBannerConfig, resolve: () => void) {
    this.message = config.message;
    this.submessage = config.submessage;
    this.type = config.type;
    this.resolveToClose = resolve;
    this.showing = true;
    this.countdownRunning = true;
  }

  public dispose(): void {
    this.subscriptions.dispose();
  }

  private countdownRunning = false;

  /**
   * countdown got to zero.  Also invoked as side-effect
   * of setting `this.countdownRunning = false` after the user clicked
   * the close button
   */
  countdownStopped(cancelled: boolean): void {
    if (!cancelled) { // else we closed after the user clicked the close button
      this.close();
    }
  }

  /**
   * user clicked the close button
   */
  countdownClosed(): void {
    this.close();
  }

  private close(): void {
    if (this.resolveToClose) {
      this.showing = this.countdownRunning = false;
      this.resolveToClose();
      this.resolveToClose = null;
    }
  }

  private handleTransaction(config: EventConfigTransaction) {
    if ((config as any).originatingUiElement) {
      return;
    }

    const message = config.message;
    const submessage = `<etherscanlink text="View on Etherscan" address="${config.receipt.transactionHash}" hide-clipboard-button type="tx"></etherscanlink><div class='arrow'></div>`;

    this.queueEventConfig({
      message,
      submessage,
      type: EventMessageType.Transaction,
    });
  }

  private handleException(config: EventConfigException | any): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    let ex: any;
    let message: string;
    if (!(config instanceof EventConfigException)) {
      // then config is the exception itself
      ex = config as any;
    } else {
      ex = config.exception;
      message = config.message;
    }

    this.queueEventConfig({
      message: `${message ? `${message}: ` : ""}${ex?.reason ?? ex?.message ?? ex}`,
      submessage: null,
      type: EventMessageType.Exception });
  }

  private handleFailure(config: EventConfig | string): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    const bannerConfig = {
      message: (typeof config === "string")
        ? config as string : config.message,
      submessage: null,
      type: EventMessageType.Failure,
    };

    this.queueEventConfig(bannerConfig);
  }

  private handleWarning(config: EventConfig | string): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    const bannerConfig = {
      message: (typeof config === "string")
        ? config as string : config.message,
      submessage: null,
      type: EventMessageType.Warning,
    };

    this.queueEventConfig(bannerConfig);
  }

  private handleValidationError(config: EventConfig | string): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    const bannerConfig = {
      message: (typeof config === "string")
        ? config as string : config.message,
      type: EventMessageType.Failure,
      submessage: null,
    };

    this.queueEventConfig(bannerConfig);
    console.error(bannerConfig.message);
  }

  private handleInfo(config: EventConfig | string): void {

    if ((config as any).originatingUiElement) {
      return;
    }

    const bannerConfig = {
      message: (typeof config === "string")
        ? config as string : config.message,
      type: EventMessageType.Info,
      submessage: null,
    };

    this.queueEventConfig(bannerConfig);
  }

  private queueEventConfig(config: IBannerConfig): void {
    // TODO: enable these to stack vertically
    this.queue.next(config);
  }
}

interface IBannerConfig {
  type: EventMessageType;
  message: string;
  submessage?: string;
}
