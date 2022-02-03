export class PCountdownCircularDemo {

  startAt = 10;
  currentValue = 10;
  running = true;
  paused = false;

  clicked(): void {
    this.paused = !this.paused;
  }

  toggleRunning(): void {
    this.running = !this.running;
    this.currentValue = this.running ? this.startAt : 0;
  }

  ticked(secondsLeft: number) {
    this.currentValue = secondsLeft;
  }

  stopped(cancelled: boolean): void {
    this.currentValue = 0;
    setTimeout(() => alert(`Stopped, cancelled = ${cancelled}`), 0);
  }
}
