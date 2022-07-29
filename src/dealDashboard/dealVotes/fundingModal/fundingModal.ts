import { DealTokenSwap } from "../../../entities/DealTokenSwap";
import { IDialogController } from "aurelia";

export class FundingModal {
  deal: DealTokenSwap;

  constructor(@IDialogController public controller: IDialogController) {
  }
  public activate(model: {deal: DealTokenSwap}): void {
    this.deal = model.deal;
  }
}
