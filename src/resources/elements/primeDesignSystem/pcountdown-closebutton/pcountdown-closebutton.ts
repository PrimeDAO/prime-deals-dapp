import { customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./pcountdown-closebutton.scss";

@customElement("pcountdown-closebutton")
export class PCountdownClosebutton {
  /**
   * invoked when countdown ends
   */
  @bindable stopped: ({ cancelled: boolean }) => void;
  @bindable.booleanAttr paused = false;
  running = true;

  // pauseChanged(newValue) {
  //   this.countdownPaused = newValue;
  // }

  countdownStopped(cancelled: boolean): void {
    setTimeout(() => { if (this.stopped) { this.stopped({ cancelled }); } }, 100);
  }

  close(): void {
    this.running = false;
  }
}
