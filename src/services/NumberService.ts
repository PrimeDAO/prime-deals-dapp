﻿import { BigNumber } from "ethers";

const numeral = require("numeral");

// export enum RoundingType {
//   Bankers = 1,
//   HalfUp = 2
// }

export interface IToStringOptions {
  /**
   * number of significant digits
   */
  // precision?: string | number,
  /**
   * truncate with 'k', 'M','B', etc.
   * average takes precedence over thousandSeparated if both are present
   */
  average?: boolean,
  /**
   * places after the decimal, padded with zeroes if needed.
   * default is 2
   * If you supply 0, then will output a whole number rounded up by any fractional part.
   * If you supply -1, then will show all decimal values, or no decimal place if there isn't one
   */
  mantissa?: string | number,
  /**
   * insert commas
   */
  thousandSeparated?: boolean,
}

export class NumberService {

  private readonly currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,

  });

  /**
   * @param value
   * @param format
   */
  public toString(value: number | string, options?: IToStringOptions,
  ): string | null | undefined {

    // this helps to display the erroneus value in the GUI
    if ((typeof value === "string") || (value === null) || (value === undefined)) {
      return value as any;
    }

    if (Number.isNaN(value)) {
      return null;
    }

    const thousandSeparated = !options?.average && options?.thousandSeparated;
    const mantissa = (options?.mantissa !== undefined) ? this.fromString(options?.mantissa) : 2;

    let formatString: string;

    if (mantissa > 0) {
      formatString = "0.".padEnd(mantissa + 2, "0");
    } else if (!mantissa) {
      formatString = "0";
    }
    else if (mantissa === -1) {
      formatString = ".[0]";
    }

    if (thousandSeparated) {
      formatString = "0," + formatString;
    } else if (options?.average) {
      formatString = formatString + "a";
    }
    /**
     * numeral.js is no longer maintained.  It has a bug where for small numbers it always
     * returns NaN.
     */
    if (!!value && (Math.abs(value) <= 0.0000001)) {
      return numeral(0).format(formatString, Math.trunc) as string;
    } else {
      /**
       * supply trunc as rounding function because we don't want to round up
       */
      return numeral(value).format(formatString, Math.trunc) as string;
    }
  }

  public formatCurrency(data: string | undefined | number, decimalPlaces = 2) {
    if (isNaN(Number(data))) return data;
    const number = this.fromString(String(data), decimalPlaces);
    const value = this.currencyFormatter.format(number).replace(".00", "");
    return value;
  }

  /**
   * returns number with `digits` number of digits.
   * @param value the value
   * @param precision Round to the given precision
   * @param exponentialAt Go exponential at the given magnitude, or low and high values
   * @param roundUp 0 to round up, 1 to round down
   */
  // public toFixedNumberString(
  //   value: string | number,
  //   precision = 5,
  //   exponentialAt: number | [number, number] = [-7, 20],
  //   roundUp = false): string | null | undefined {

  //   if ((value === null) || (value === undefined)) {
  //     return value as any;
  //   }

  //   if ((value.toString().trim() === "") || Number.isNaN(Number(value))) {
  //     return undefined;
  //   }

  //   const bnClone = BN.clone({ EXPONENTIAL_AT: exponentialAt });
  //   /**
  //    * value may be a number or a string
  //    * because we're using BigNumber.js it can be a fixed number
  //    *
  //    * ethers BigNumber doesn't accept fixed point except when converting ETH to WEI.
  //    */
  //   const bn = new bnClone(value.toString());

  //   const result = bn.toPrecision(precision, roundUp ? 0 : 1);

  //   return result;
  // }

  public fromString(value: string | number | BigNumber, decimalPlaces = 1000): number {

    if (typeof (value) === "number") return value;

    /**
     * ok, isn't a string, but still helpful
     */
    if (BigNumber.isBigNumber(value)) {
      return value.toNumber();
    }

    // this helps to display the erroneus value in the GUI
    if (!this.stringIsNumber(value, decimalPlaces)) {
      return value as any;
    }

    if (value && value.match(/^\.0{0,}$/)) {
      /**
       * numeral returns `null` for stuff like '.', '.0', '.000', etc
       */
      return 0;
    } else {
      return numeral(value).value();
    }
  }

  /**
   * returns whether string represents a number.  can have commas and a decimal
   * (note decimal is not allowed if decimalPlaces is 0)
   * default number of decimmals is basically unlimited
   * @param value
   */
  public stringIsNumber(value?: string | number, decimalPlaces = 1000): boolean {

    if (typeof value === "number") { return true; }

    if ((value === null) || (value === undefined)) { return false; }

    value = value.trim();

    const regex = new RegExp(this.getNumberRegexString(decimalPlaces));
    return regex.test(value);
  }

  // public round(value: number, decimals: number, type: RoundingType): number {
  //   return type === RoundingType.Bankers ? this.roundBankers(value, decimals) : this.roundHalfUp(value, decimals);
  // }

  // public roundHalfUp(value: number, decimals: number): number {
  //   return ((value !== null) && (value !== undefined)) ? this._halfUpRound(value, decimals) : value;
  // }

  // public roundBankers(value: number, decimals: number): number {
  //   return ((value !== null) && (value !== undefined)) ? this._bankersRound(value, decimals) : value;
  // }

  // private _bankersRound(num: number, decimals: number) {
  //   const d = decimals || 0;
  //   const m = Math.pow(10, d);
  //   const n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
  //   const i = Math.floor(n);
  //   const f = n - i;
  //   const e = 1e-8; // Allow for rounding errors in f
  //   const r = (f > 0.5 - e && f < 0.5 + e) ? ((i % 2 === 0) ? i : i + 1) : Math.round(n);
  //   return d ? r / m : r;
  // }

  // // up if .5 or higher, otherwise down
  // private _halfUpRound(num: number, decimals: number) {
  //   const pow = Math.pow(10, (decimals) ? Math.abs(decimals) : 0);
  //   return Math.round(num * pow) / pow;
  // }

  // /**
  //    * >= 1,000,000,000,000 => "T"
  //    * >= 1,000,000,000     => "B"
  //    * >= 1,000,000         => "M"
  //    * >= 1,000             => "K"
  //    * @param num
  //    */
  // public magnitudeLabel(num: number | string): string {
  //   if ((num === undefined) || (num === null) || Number.isNaN(num)) {
  //     return "";
  //   }

  //   if (typeof num === "string") {
  //     num = this.fromString(num);
  //   }

  //   if (num > 1000) {
  //     return "";
  //   }

  //   return (num >= 1000000000000) ? "T" :
  //     (num >= 1000000000) ? "B" :
  //       (num >= 1000000) ? "M" : "K";
  // }

  private getNumberRegexString(decimalPlaces = 0) {
    return (decimalPlaces !== 0) ?
      // tslint:disable-next-line: max-line-length
      `^[+|-]?(((\\d{1,3}\\,)((\\d{3}\\,)?)(\\d{3}?(\\.\\d{0,${decimalPlaces}})?))|(\\d{1,})|(\\d{0,}(\\.\\d{0,${decimalPlaces}})))$` :
      "^[+|-]?(((\\d{1,3}\\,)((\\d{3}\\,)?)(\\d{3}))|(\\d{1,}))$";
  }

  // private toNonExponentialString(value): string {
  //   const valueString = value.toString();
  //   const parts = new RegExp(/^(-)?([0-9]+)\.?([0-9]+)?e([-+])?([0-9]+)$/).exec(valueString);
  //   if (parts) {
  //     const sign = parts[1];
  //     const iPart = parts[2];
  //     const fPart = parts[3];
  //     const eSign = parts[4];
  //     const e = parts[5];
  //     const zeros = "0".repeat(parseInt(e) - (eSign === "-" ? iPart : fPart || "").length);
  //     return (sign || "") + (eSign === "-" ? "0." + zeros : "") + iPart + (fPart || "") + (eSign !== "-" ? zeros : "");
  //   } else {
  //     return valueString;
  //   }
  // }

}
