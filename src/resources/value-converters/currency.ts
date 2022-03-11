import { autoinject } from "aurelia-framework";
import { NumberService } from "../../services/NumberService";

@autoinject
export class CurrencyValueConverter {

  constructor(private numberService: NumberService) { }

  public toView(value: string, decimalPlaces = 0): string | number {
    return this.numberService.formatCurrency(value, decimalPlaces);
  }
}
