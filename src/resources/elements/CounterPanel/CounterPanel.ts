import { containerless } from "aurelia-framework";
// import { bindable } from "aurelia-typed-observable-plugin";
import "./CounterPanel.scss";

interface ICounterInfo {
  created: number
  successful: number
  jointVentures: number
}

@containerless
export class CounterPanel {
  // @bindable deals: ICounterInfo;
  deals: ICounterInfo = {
    created: 0,
    successful: 0,
    jointVentures: 0,
  };

  attached():void {
    this.deals.created = 1000;
    this.deals.successful = 750;
    this.deals.jointVentures = 300;
  }
}
