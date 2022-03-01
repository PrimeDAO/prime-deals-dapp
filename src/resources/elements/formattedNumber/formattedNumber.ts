import { autoinject, computedFrom, containerless, } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { NumberService } from "services/NumberService";

@autoinject
@containerless
export class FormattedNumber {

  //  @bindable public format?: string;
  /**
   * how many significant digits we want to display
   */
  // @bindable public precision?: string | number;
  @bindable.booleanAttr public average = false;
  /**
   * places after the decimal, padded with zeroes if needed
   */
  @bindable public mantissa?: string | number;
  @bindable public value: number | string;
  @bindable public placement = "top";
  @bindable public defaultText = "--";
  @bindable.booleanAttr public hideTooltip = false;
  @bindable.booleanAttr public thousandsSeparated = false;

  private text: string;
  private _value: number | string;

  constructor(private numberService: NumberService) {
  }

  public valueChanged(): void {
    if ((this.value === undefined) || (this.value === null)) {
      this.text = this.defaultText;
      return;
    }

    this._value = this.value;

    let text = null;

    if ((this._value !== null) && (this._value !== undefined)) {
      text = this.numberService.toString(Number(this._value),
        {
          // precision: this.precision,
          average: this.average,
          mantissa: this.mantissa,
          thousandSeparated: this.thousandsSeparated,
        },
      );
    }

    this.text = text ?? this.defaultText;

  }

  @computedFrom("_value")
  private get tooltip():string {
    return this._value?.toString(10);
  }
}
