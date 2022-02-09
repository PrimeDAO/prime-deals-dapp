import { customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./pcountdown-closebutton.scss";

@customElement("pcountdown-closebutton")
export class PCountdownClosebutton {
  /**
   * invoked when countdown ends
   */
  @bindable stopped: ({ cancelled: boolean }) => void;

  countdownPaused = false;

  countdownClicked(): void {
    this.countdownPaused = !this.countdownPaused;
  }

  countDownStopped(cancelled: boolean): void {
    setTimeout(() => { if (this.stopped) { this.stopped({ cancelled }); } }, 100);
  }
}
