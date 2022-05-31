import { valueConverter } from "aurelia";
import { NumberService } from "../../services/NumberService";

@valueConverter("currency")
export class CurrencyValueConverter {

  constructor(private numberService: NumberService) { }

  public toView(value: string, decimalPlaces = 2): string | number {
    return this.numberService.formatCurrency(value, decimalPlaces);
  }
}
