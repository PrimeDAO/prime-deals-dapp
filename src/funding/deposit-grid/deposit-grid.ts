import { ITokenFunding } from "entities/TokenFunding";
import "./deposit-grid.scss";
import { containerless, bindable } from "aurelia-framework";
import { IDAO } from "entities/DealRegistrationTokenSwap";
import { tokenGridColumns } from "funding/funding-grid-columns";
import { IGridColumn } from "resources/elements/primeDesignSystem/pgrid/pgrid";

@containerless
export class DepositGrid {
  @bindable dao: IDAO;
  @bindable daoTokens: ITokenFunding[];
  @bindable fundingDaysLeft: number;
  @bindable showChip = true;
  private tokenGridColumns: IGridColumn[] = tokenGridColumns;
}
