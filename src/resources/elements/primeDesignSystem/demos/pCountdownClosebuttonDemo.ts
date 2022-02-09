export class PCountdownClosebuttonDemo {

  countdownPanel: HTMLElement;
  countdownPaused = false;

  countdownComplete = false;
  countdownClosed = false;

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
    // this.countdownButton.style.display = "none";
  }
}
