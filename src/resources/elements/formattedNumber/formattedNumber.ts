import { bindable, containerless } from "aurelia";
import { NumberService } from "services/NumberService";
import { toBoolean } from "../../binding-behaviours";

@containerless
export class FormattedNumber {

  //  @bindable public format?: string;
  /**
   * how many significant digits we want to display
   */
  // @bindable public precision?: string | number;
  @bindable({set: toBoolean}) public average = false;
  /**
   * places after the decimal, padded with zeroes if needed
   */
  @bindable public mantissa?: string | number;
  @bindable public value: number | string;
  @bindable public placement = "top";
  @bindable public defaultText = "--";
  @bindable({set: toBoolean}) public hideTooltip = false;
  @bindable({set: toBoolean}) public thousandsSeparated = false;

  private text: string;
  private _value: number | string;

  constructor(private numberService: NumberService) {
  }

  private get tooltip(): string { // TODO test this and remove comment
    return this._value?.toString(10);
  }

  binding() {
    this.updateValue();
  }

  public valueChanged(): void {
    this.updateValue();
  }

  public updateValue(): void {
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
}
