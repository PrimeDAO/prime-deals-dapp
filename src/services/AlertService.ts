import { autoinject } from "aurelia-framework";
import { EventConfig, EventConfigException } from "./GeneralEvents";
import { DialogCloseResult, DialogService } from "./DialogService";
import { DisposableCollection } from "./DisposableCollection";
import { EventAggregator } from "aurelia-event-aggregator";
import { Utils } from "services/utils";
import { Alert, IAlertModel } from "resources/dialogs/alert/alert";

@autoinject
export class AlertService {

  // probably doesn't really need to be a disposable collection since this is a singleton service
  private subscriptions: DisposableCollection = new DisposableCollection();

  constructor(
    private eventAggregator: EventAggregator,
    private dialogService: DialogService,
  ) {
  }

  configureHandleErrors(): void {
    this.subscriptions.push(this.eventAggregator
      .subscribe("handleException",
        (config: EventConfigException | any) => this.handleException(config)));
    this.subscriptions.push(this.eventAggregator
      .subscribe("handleFailure", (config: EventConfig | string) => this.handleFailure(config)));
  }

  private handleException(config: EventConfigException | any) {
    let ex: any;
    let message: string;
    if (!(config instanceof EventConfigException)) {
      // then config is the exception itself
      ex = config as any;
    } else {
      ex = config.exception;
      message = config.message;
    }

    this.showAlert({message: `${message ? `${message}: ` : ""}${Utils.extractExceptionMessage(ex)}`});
  }

  private handleFailure(config: EventConfig | string) {
    this.showAlert({ message: this.getMessage(config) });
  }

  private getMessage(config: EventConfig | string): string {
    return (typeof config === "string") ? config : config.message;
  }

  public showAlert(config: IAlertModel): Promise<DialogCloseResult> {
    return this.dialogService.open(Alert, config, { keyboard: true }, config.className);
  }
}

export { ShowButtonsEnum, IAlertModel } from "resources/dialogs/alert/alert";
