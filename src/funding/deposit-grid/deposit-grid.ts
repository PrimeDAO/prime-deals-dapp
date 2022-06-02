import { IDAO } from "entities/DealRegistrationTokenSwap";
import { tokenGridColumns } from "funding/funding-grid-columns";
import { IGridColumn } from "resources/elements/primeDesignSystem/pgrid/pgrid";
import { DealTokenSwap, ITokenCalculated } from "entities/DealTokenSwap";
import { bindable, containerless } from "aurelia";

@containerless
export class DepositGrid {
  @bindable deal: DealTokenSwap;
  @bindable dao: IDAO;
  @bindable daoTokens: ITokenCalculated[];
  @bindable showChip = true;
  private tokenGridColumns: IGridColumn[] = tokenGridColumns;
  private get fundingDaysLeft():number{
    return Number((this.deal.timeLeftToExecute / (60*60*24*1000)).toFixed(0));
  }
}
