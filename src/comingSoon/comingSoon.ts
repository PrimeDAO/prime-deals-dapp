import { AppStartDate } from "app";
import { IEventAggregator, inject } from "aurelia";
import { DateService } from "services/DateService";

@inject()
export class ComingSoon {

  private msUntilCanLockCountdown: number;

  constructor(
    private dateService: DateService,
    @IEventAggregator private eventAggregator: IEventAggregator,
  ) {
    this.eventAggregator.subscribe("secondPassed", () => {
      this.msUntilCanLockCountdown = this.getLeft();
    });
    this.msUntilCanLockCountdown = this.getLeft();
  }

  private getLeft(): number {
    return Math.max(AppStartDate.getTime() - Date.now(), 0);
  }
}
