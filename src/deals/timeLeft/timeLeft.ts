import { autoinject, computedFrom } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { DealStatus, IDeal } from "entities/IDealTypes";
import "./timeLeft.scss";

@autoinject
export class TimeLeft {

  @bindable deal: IDeal;
  @bindable.booleanAttr hideIcons: boolean;
  @bindable.booleanAttr largest: boolean;
  @bindable.booleanAttr contained: boolean;

  timeLeft: HTMLElement;
  tippyInstance: any;
  reversedEnum = {};

  constructor() {
    /**
     * is the name of the enum for use as the classname in the view
     */
    Object.keys(DealStatus).forEach(key => {
      this.reversedEnum[DealStatus[key]] = key;
    });

  }
  @computedFrom("deal.status")
  get status(): string {
    return this.reversedEnum[this.deal.status];
  }

  // constructor(
  //   private dateService: DateService,
  // ) {}

  // @computedFrom("deal.startsInMilliseconds", "deal.hasNotStarted", "deal.startTime")
  // get proximity(): number {
  //   const soon = 86400000;
  //   const comingUp = soon * 5;
  //   if (this.deal?.hasNotStarted) {
  //     if (!this.tippyInstance) {
  //       this.tippyInstance = tippy(this.timeLeft,
  //         {
  //           content: this.dateService.toString(this.deal.startTime, "ddd MMM do - kk:mm z"),
  //         });
  //     }
  //     if (this.deal.startsInMilliseconds > comingUp) {
  //       return 3; // faroff
  //     } else if (this.deal.startsInMilliseconds <= soon) {
  //       return 1; // soon
  //     } else {
  //       return 2; // comingUp
  //     }
  //   }
  // }
}
