﻿import { BigNumber } from "ethers";
import { fromWei, toWei } from "services/EthereumService";
import { valueConverter } from "aurelia";

/**
 * Convert between Wei (as BigNumber) in viewmodel and eth (as string) in view.
 * Note that even if the viewmodel supplies a number, modified values are saved back
 * to the viewmodel as BigNumber.
 */
@valueConverter("ethwei")
export class EthweiValueConverter {

  /**
   * ETH string from HTML input ==> BigNumber for the model
   *
   * When the string cannot be converted to a number, this will return the original string.
   * This helps the user see the original mistake.  Validation will need to make sure that the
   * incorrect value is not persisted.
   *
   * @param ethValue
   * @param decimals
   */
  public fromView(ethValue: string | number, decimals: string | number): BigNumber {
    if ((ethValue === undefined) || (ethValue === null) || ((typeof ethValue === "string") && ((ethValue as string)?.trim() === ""))) {
      return null;
    }

    if (decimals === undefined) {
      throw new Error("ethwei: `decimals` is missing");
    }

    return toWei(ethValue.toString(), decimals);
  }

  /**
   *  Wei BigNumber|string from model ==> ETH string in HTML input
   * @param weiValue
   * @param decimals
   */
  public toView(weiValue: BigNumber | string, decimals: string | number): string {
    try {
      if ((weiValue === undefined) || (weiValue === null)) {
        return "";
      }

      if (decimals === undefined) {
        throw new Error("ethwei: `decimals` is missing");
      }

      return fromWei(weiValue, decimals);
    } catch (ex) {
      return weiValue.toString();
    }
  }
}
