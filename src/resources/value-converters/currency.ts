import { NumberService } from "../../services/NumberService";
import { autoinject } from "aurelia-framework";

@autoinject
export class CurrencyValueConverter {

  constructor(private numberService: NumberService) { }

  public toView(value: string, decimalPlaces = 2): string | number {
    return this.numberService.formatCurrency(value, decimalPlaces);
  }
}
