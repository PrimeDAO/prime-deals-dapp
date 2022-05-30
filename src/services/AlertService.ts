import { inject, IEventAggregator, DialogCloseResult } from "aurelia";
import { EventConfig, EventConfigException } from "./GeneralEvents";
import { DisposableCollection } from "./DisposableCollection";
import { Utils } from "services/utils";
import { Alert, IAlertModel } from "resources/dialogs/alert/alert";
import { DialogService } from "services/DialogService";

@inject()
export class AlertService {

  // probably doesn't really need to be a disposable collection since this is a singleton service
  private subscriptions: DisposableCollection = new DisposableCollection();

  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
    private dialogService: DialogService,
  ) {
  }

  // private configureHandleErrors(): void {
  //   this.subscriptions.push(this.eventAggregator
  //     .subscribe("handleException",
  //       (config: EventConfigException | any) => this.handleException(config)));
  //   this.subscriptions.push(this.eventAggregator
  //     .subscribe("handleFailure", (config: EventConfig | string) => this.handleFailure(config)));
  // }

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
    return this.dialogService.open(() => Alert, config);
  }
}

export { ShowButtonsEnum, IAlertModel } from "resources/dialogs/alert/alert";
