import { containerless } from "aurelia-framework";
import "./counterPanel.scss";

interface ICounterInfo {
  coLiquidities: number
  created: number
  successful: number
}

@containerless
export class CounterPanel {
  public deals: ICounterInfo = {
    created: 0,
    successful: 0,
    coLiquidities: 0,
  };

  public attached(): void {
    this.deals.created = 1000;
    this.deals.successful = 750;
    this.deals.coLiquidities = 300;
  }

}
