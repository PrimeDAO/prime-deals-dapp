import { customElement, bindingMode } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./pcountdown-closebutton.scss";

@customElement("pcountdown-closebutton")
export class PCountdownClosebutton {
  /**
   * invoked when countdown ends or the countdown
   * is manually stopped by setting running to `true`.
   */
  @bindable stopped?: ({ cancelled: boolean }) => void;
  /**
   * invoked when the user clicks the close button.
   */
  @bindable closed?: () => boolean;
  /**
   * container fully controls this, such as when detecting mouse hover
   */
  @bindable.booleanAttr paused = false;
  /**
   * so container can manually start or stop the countdown
   */
  @bindable.booleanAttr({ defaultBindingMode: bindingMode.twoWay}) running = true;

  /**
   * Is `cancelled` when the container manually stops the countdown by setting `running` to false,
   * otherwise when the countdown hits 0.
   * @param cancelled
   */
  countdownStopped(cancelled: boolean): void {
    /**
     * timeout because in this specific situation
     * other prior events tend to occur that need to proceed first
     */
    setTimeout(() => {
      if (this.stopped) {
        this.stopped({ cancelled });
      }
    }, 100);
  }

  /**
   * invoked when the user clicks the close button.
   * The container can manually stop the countdown by setting `running` to false,
   * but in that case this isn't invoked.
   */
  close(): void {
    /**
     * timeout because in this specific situation
     * other prior events tend to occur that need to proceed first
     */
    setTimeout(() => {
      if (this.closed) {
        this.closed();
      }
    }, 100);
  }
}
