import { DealTokenSwap } from "../../../entities/DealTokenSwap";
import { DialogController } from "aurelia";

export class FundingModal {
  deal: DealTokenSwap;

  constructor(public controller: DialogController) {
  }

  public load(model: { deal: DealTokenSwap }): void {
    this.deal = model.deal;
  }
}
