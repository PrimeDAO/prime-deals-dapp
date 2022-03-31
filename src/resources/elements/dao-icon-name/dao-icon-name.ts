import { IDAO, IToken } from "../../../entities/DealRegistrationTokenSwap";
import "./dao-icon-name.scss";
import { containerless, bindable, computedFrom } from "aurelia-framework";

/**
 * This is a custom display for overlaping token icons
 * <dao-icon-name />
 */
@containerless
export class DaoIconName {
  @bindable primaryDao: IDAO | IToken;
  @bindable partnerDao : IDAO | IToken;
  @bindable iconSize = 34;
  @bindable useTokenSymbol = false;

  @computedFrom("iconSize")
  get iconStyle() : string{
    return `width:${this.iconSize}px;height:${this.iconSize}px`;
  }
  @computedFrom("iconSize", "partnerDao")
  get gridStyle(): string{
    return this.partnerDao ? `grid-template-columns: ${Number(this.iconSize) + 4}px ${(Number(this.iconSize) + 4) - 12}px auto;` : `grid-template-columns: ${Number(this.iconSize) + 8}px auto;`;
  }
}
