import { bindable, customElement } from "aurelia";
import { EventMessageType } from "resources/elements/primeDesignSystem/types";

@customElement("ppopup-notification")
export class PPopupNotification {
  @bindable data: Record<string, unknown>;
  @bindable type: EventMessageType;
  @bindable title: string;
  @bindable message: string;
  @bindable submessage: string;
  @bindable paused = false;
  @bindable running = false;
  @bindable stopped?: ({ cancelled: boolean }) => void;
  @bindable closed?: () => void;
  pauseCountDown(yes: boolean): void {
    this.paused = yes;
  }
  countDownStopped(cancelled: boolean): void {
    if (this.stopped) {
      this.stopped({ cancelled });
    }
  }
  countdownClosed(): void {
    if (this.closed) {
      this.closed();
    }
  }
  private get iconClass(): string {
    switch (this.type) {
      case EventMessageType.Failure:
      case EventMessageType.Exception:
        return "fas fa-times-circle";
      case EventMessageType.Warning:
        return "fas fa-exclamation-triangle";
      case EventMessageType.Info:
        return "fas fa-info-circle";
      case EventMessageType.Success:
        return "fas fa-check-circle";
      case EventMessageType.Transaction:
        return "fas fa-check-circle";
    }
  }

  private get typeClass(): string {
    switch (this.type) {
      case EventMessageType.Failure:
      case EventMessageType.Exception:
        return "failed";
      case EventMessageType.Warning:
        return "warning";
      case EventMessageType.Info:
        return "info";
      case EventMessageType.Success:
        return "success";
      case EventMessageType.Transaction:
        return "transaction";
    }
  }

  private get titleText(): string {
    if (this.title) return this.title;
    switch (this.type) {
      case EventMessageType.Failure:
      case EventMessageType.Exception:
        return "Error";
      case EventMessageType.Warning:
        return "Warning";
      case EventMessageType.Info:
        return "Information";
      case EventMessageType.Success:
        return "Success";
      case EventMessageType.Transaction:
        return "Completed";
    }
  }
}
