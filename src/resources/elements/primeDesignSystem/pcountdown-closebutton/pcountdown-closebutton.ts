import { customElement, bindingMode } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./pcountdown-closebutton.scss";

@customElement("pcountdown-closebutton")
export class PCountdownClosebutton {
  /**
   * invoked when countdown ends
   */
  @bindable stopped: ({ cancelled: boolean }) => void;
  /**
   * container fully controls this, such as when detecting mouse hover
   */
  @bindable.booleanAttr paused = false;

  /**
   * so container can manually start or stop
   */
  @bindable.booleanAttr({ defaultBindingMode: bindingMode.twoWay}) running = true;

  /**
   * Is `cancelled` when the user clicks the close button, otherwise when
   * the countdown hits 0.
   * @param cancelled 
   */
  countdownStopped(cancelled: boolean): void {
    setTimeout(() => { if (this.stopped) { this.stopped({ cancelled }); } }, 100);
  }

  /**
   * involved when the user clicks the close button
   */
  close(): void {
    this.running = false;
  }
}
