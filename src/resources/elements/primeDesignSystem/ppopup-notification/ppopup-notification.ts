import { customElement, computedFrom } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { EventMessageType } from "resources/elements/primeDesignSystem/types";
import { AureliaHelperService } from "services/AureliaHelperService";
import "./ppopup-notification.scss";

@customElement("ppopup-notification")
export class PPopupNotification {
  @bindable data: Record<string, unknown>;
  @bindable.number type: EventMessageType;
  @bindable title: string;
  @bindable message: string;
  @bindable submessage: string;
  @bindable.booleanAttr paused = false;
  @bindable.booleanAttr running = false;
  @bindable stopped?: ({ cancelled: boolean }) => void;
  @bindable closed?: () => void;

  private body: HTMLElement;
  private subbody: HTMLElement;
  private container: HTMLElement;

  constructor(private aureliaHelperService: AureliaHelperService) {}

  attached() {
    this.messageChanged(this.message);
    this.submessageChanged(this.submessage);
    this.container.addEventListener("mouseenter", ( _event ) => this.pauseCountDown(true), false);
    this.container.addEventListener("mouseleave", ( _event ) => this.pauseCountDown(false), false);
  }

  messageChanged(newValue: string): void {
    if (this.body) {
      this.body.innerHTML = newValue;
      this.aureliaHelperService.enhanceElement(this.body, this, true);
    }
  }

  submessageChanged(newValue: string): void {
    if (this.subbody) {
      if (newValue) {
        this.subbody.innerHTML = newValue;
        this.aureliaHelperService.enhanceElement(this.subbody, this, true);
      } else {
        this.subbody.innerHTML = "";
      }
    }
  }

  pauseCountDown(yes: boolean): void {
    this.paused = yes;
  }

  countDownStopped(cancelled: boolean): void {
    this.shutdown();
    if (this.stopped) {
      this.stopped({ cancelled });
    }
  }

  countdownClosed(): void {
    this.shutdown();
    if (this.closed) {
      this.closed();
    }
  }

  shutdown() {
    this.container.removeEventListener("mouseenter", ( _event ) => this.pauseCountDown(true), false);
    this.container.removeEventListener("mouseleave", ( _event ) => this.pauseCountDown(false), false);
  }

  @computedFrom("type")
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

  @computedFrom("type")
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

  @computedFrom("type", "title")
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
