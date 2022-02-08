import { customElement, bindingMode, computedFrom } from "aurelia-framework";
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
  /**
   * radius in pixels.
   */
  @bindable.number radius = 12;

  timerId: any;
  secondsLeft = 0;
  startTime: number;
  pausedTime: number;
  pausedDuration = 0;
  // canvas: HTMLCanvasElement;
  isAttached = false;
  pie: HTMLElement;

  // get percSccVariable(): number {
  //   return Number.parseInt(Utils.getCssVariable("perc", this.pie));
  // }

  @computedFrom("startAt", "secondsLeft")
  get percentageLeft(): number {
    return this.startAt ? ((this.startAt - this.secondsLeft) / this.startAt) * 100 : 0;
  }

  private storePercentageLeftChanged(): void {
    Utils.setCssVariable("--perc", this.percentageLeft.toString(), this.pie);
  }

  private setSecondsLeft(left: number): number {
    this.secondsLeft = left;
    this.storePercentageLeftChanged();
    return left;
  }

  attached() {
    this.isAttached = true;
    if (this.running) {
      this.runningChanged(this.running);
    }
  }

  detached() {
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

        // const ctx = this.canvas.getContext("2d");
        // ctx.strokeStyle = "white"; // "#64557d";
        // ctx.beginPath();
        // ctx.lineWidth = 2;
        // ctx.arc(this.radius, this.radius, this.radius, 0, 2*Math.PI);
        // ctx.stroke();

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
                setTimeout(() => {if (this.ticked) { this.ticked( { secondsLeft: this.secondsLeft }); } }, 100 );
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
    this.setSecondsLeft(this.startAt);
    this.storePercentageLeftChanged();
    this.paused = this.running = false;
    setTimeout(() => { if (this.stopped) { this.stopped({ cancelled }); } }, 100);
  }

  // private polarToCartesian(
  //   centerX: number,
  //   centerY: number,
  //   radius: number,
  //   angleInDegrees: number): { x: number, y: number} {
  //   const angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  //   return {
  //     x: centerX + (radius * Math.cos(angleInRadians)),
  //     y: centerY + (radius * Math.sin(angleInRadians)),
  //   };
  // }

  // private describeArc(x, y, radius, startAngle, endAngle): Array<string> {

  //   const start = this.polarToCartesian(x, y, radius, endAngle);
  //   const end = this.polarToCartesian(x, y, radius, startAngle);

  //   const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  //   const d = [
  //     "M", start.x, start.y,
  //     "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  //   ].join(" ");

  //   return d;
  // }
}
