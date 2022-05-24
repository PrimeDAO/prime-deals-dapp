import { containerless/*, bindable*/ } from "aurelia";
import "./counterPanel.scss";

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

  attaching():void {
    this.deals.created = 1000;
    this.deals.successful = 750;
    this.deals.coLiquidities = 300;
  }
}
