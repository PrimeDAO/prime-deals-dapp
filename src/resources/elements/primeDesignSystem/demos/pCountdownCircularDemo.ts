export class PCountdownCircularDemo {

  startAt = 9;
  startAt2 = 15;
  startAt3 = 777;
  currentValue = 9;
  running = true;
  running2 = true;
  running3 = true;
  paused = false;

  clicked(): void {
    this.paused = !this.paused;
  }

  toggleRunning(): void {
    this.running = !this.running;
    this.currentValue = this.running ? this.startAt : 0;
  }

  toggleRunning2(): void {
    this.running2 = !this.running2;
  }

  toggleRunning3(): void {
    this.running3 = !this.running3;
  }
  ticked(secondsLeft: number) {
    this.currentValue = secondsLeft;
  }

  stopped(cancelled: boolean): void {
    this.currentValue = 0;
    setTimeout(() => alert(`Stopped, cancelled = ${cancelled}`), 0);
  }
}
