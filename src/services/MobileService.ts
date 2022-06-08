import { inject } from "aurelia";
import { Utils } from "./utils";

@inject()
export class MobileService {
  public static isMobile(): boolean {
    const mobileWidth = Utils.getCssVariable("--mobile-width");
    const isMobile = window.matchMedia(`only screen and (max-width: ${mobileWidth})`).matches;

    return isMobile;
  }
}
