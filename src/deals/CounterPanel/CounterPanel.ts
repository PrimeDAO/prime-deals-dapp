import { containerless } from "aurelia-framework";
// import { bindable } from "aurelia-typed-observable-plugin";
import "./CounterPanel.scss";

interface ICounterInfo {
  created: number
  successful: number
  coLiquidities: number
}

@containerless
export class CounterPanel {
  // @bindable deals: ICounterInfo;
  deals: ICounterInfo = {
    created: 0,
    successful: 0,
    coLiquidities: 0,
  };

  attached():void {
    this.deals.created = 1000;
    this.deals.successful = 750;
    this.deals.coLiquidities = 300;
  }
}
