import { bindable, BindingMode, customElement } from "aurelia";
import { Utils } from "services/utils";

@customElement("pcountdown-circular")
export class PCountdownCircular {
  /**
   * start countdown at this number of seconds.
   */
  @bindable startAt;
  /**
   * true stops the countdown.  false restarts at the point it was paused.
   */
  @bindable({ mode: BindingMode.twoWay }) paused = false;
  /**
   * set `running` to true to start the countdown from the current value of startAt.
   * automatically switches to false when a countdown is expired or is aborted by
   * setting running to false.  Setting start to false while paused will turn paused off too.
   */
  @bindable({ mode: BindingMode.twoWay }) running = false;
  /**
   * invoked when countdown ends or manually stopped
   */
  @bindable stopped: ({ cancelled: boolean }) => void;
  /**
   * invoked on each update.  Note that could skip seconds if the browser somehow gets hung up
   * for more than a second.
   */
  @bindable ticked: ({ secondsLeft: number }) => void;
  /**
   * radius in pixels.
   */
  @bindable radius = 12;

  timerId: any;
  secondsLeft = 0;
  startTime: number;
  pausedTime: number;
  pausedDuration = 0;
  isAttached = false;
  pie: HTMLElement;

  get percentageLeft(): number {
    return this.startAt ? ((this.startAt - this.secondsLeft) / this.startAt) * 100 : 0;
  }

  private setSecondsLeft(left: number): number {
    this.secondsLeft = left;
    Utils.setCssVariable("--perc", this.percentageLeft.toString(), this.pie);
    return left;
  }

  attached() {
    this.isAttached = true;
    if (this.running) {
      this.runningChanged(this.running);
    }
  }

  detaching() {
    this.stop(false);
  }

  pausedChanged(nowPaused: boolean) {
    if (nowPaused) {
      this.pausedTime = Date.now();
    }
  }

  runningChanged(running: boolean): void {

    Utils.waitUntilTrue(() => this.startAt !== undefined);

    if (this.isAttached) {
      if (running) {
        this.setSecondsLeft(this.startAt);
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
                  this.setSecondsLeft(secondsLeft);
                } else { // <= zero
                  stop = true;
                }
                setTimeout(() => { if (this.ticked) { this.ticked({ secondsLeft: this.secondsLeft }); } }, 100);
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
  }

  stop(cancelled: boolean): void {
    clearTimeout(this.timerId);
    this.timerId = null;
    this.pausedDuration = 0;
    this.setSecondsLeft(0);
    this.paused = this.running = false;
    setTimeout(() => { if (this.stopped) { this.stopped({ cancelled }); } }, 100);
  }
}
