import { customElement, bindingMode } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { Utils } from "services/utils";
import "./pcountdown-circular.scss";

@customElement("pcountdown-circular")
export class PCountdownCircular {
  /**
   * start countdown at this number of seconds.
   */
  @bindable.number startAt;
  /**
   * true stops the countdown.  false restarts at the point it was paused.
   */
  @bindable.booleanAttr({ defaultBindingMode: bindingMode.twoWay}) paused = false;
  /**
   * set `running` to true to start the countdown from the current value of startAt.
   * automatically switches to false when a countdown is expired or is aborted by
   * setting running to false.  Setting start to false while paused will turn paused off too.
   */
  @bindable.booleanAttr({ defaultBindingMode: bindingMode.twoWay}) running = false;
  /**
   * invoked when countdown ends or manually stopped
   */
  @bindable stopped: ({ cancelled: boolean })=> void;
  /**
   * invoked on each update.  Note that could skip seconds if the browser somehow gets hung up
   * for more than a second.
   */
  @bindable ticked: ({ secondsLeft: number }) => void;

  timerId: any;
  secondsLeft = 0;
  startTime: number;
  pausedTime: number;
  pausedDuration = 0;

  pausedChanged(nowPaused: boolean) {
    if (nowPaused) {
      this.pausedTime = Date.now();
    }
  }

  runningChanged(running: boolean): void {

    Utils.waitUntilTrue(() => this.startAt !== undefined);

    if (running) {
      this.secondsLeft = this.startAt;
      this.startTime = Date.now();

      if (!this.timerId) {
        this.paused = false;

        this.timerId = setInterval(() => {
          const currentTime = Date.now();
          if (this.paused) {
            this.pausedDuration += (currentTime - this.pausedTime);
            this.pausedTime = currentTime;
          } else {
            const secondsPassed = Math.floor((currentTime - this.startTime - this.pausedDuration) / 1000);
            const secondsLeft = this.startAt - secondsPassed;
            let stop = false;
            if (secondsLeft !== this.secondsLeft) {
              if (secondsLeft > 0) {
                this.secondsLeft = secondsLeft;
              } else { // <= zero
                stop = true;
              }
              if (this.ticked) {
                setTimeout(() => this.ticked( { secondsLeft: this.secondsLeft }), 100 );
              }
              if (stop) {
                this.stop(false);
              }
            }
          }
        }, 1000);
      }
    } else { // !start
      if (this.timerId) {
        this.stop(true);
      }
    }
  }

  stop(cancelled: boolean): void {
    clearTimeout(this.timerId);
    this.timerId = null;
    this.pausedDuration = this.secondsLeft = 0;
    this.paused = this.running = false;
    if (this.stopped) {
      setTimeout(() => this.stopped({ cancelled }), 100);
    }
  }
}
