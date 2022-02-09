export class PCountdownClosebuttonDemo {

  countdownButton: HTMLElement;
  countdownComplete = false;
  countdownClosed = false;

  countDownStopped(cancelled: boolean): void {
    this.countdownComplete = !cancelled;
    this.countdownClosed = cancelled;
    // this.countdownButton.style.display = "none";
  }
}
