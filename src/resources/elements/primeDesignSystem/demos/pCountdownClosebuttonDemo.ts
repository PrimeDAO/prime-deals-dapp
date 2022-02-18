export class PCountdownClosebuttonDemo {

  countdownPanel: HTMLElement;
  countdownPaused = false;

  countdownComplete = false;
  countdownClosed = false;
  running = true;

  attached(): void {
    this.countdownPanel.addEventListener("mouseenter", ( _event ) => this.pause(true), false);
    this.countdownPanel.addEventListener("mouseleave", ( _event ) => this.pause(false), false);
  }

  detached(): void {
    this.countdownPanel.removeEventListener("mouseenter", ( _event ) => this.pause(true), false);
    this.countdownPanel.removeEventListener("mouseleave", ( _event ) => this.pause(false), false);
  }

  private pause(yes: boolean): void {
    this.countdownPaused = yes;
  }

  countDownStopped(cancelled: boolean): void {
    this.countdownComplete = !cancelled;
    this.countdownClosed = cancelled;
  }

  restart() {
    this.running = false;
    setTimeout(() => this.running = true, 0);
  }
}
