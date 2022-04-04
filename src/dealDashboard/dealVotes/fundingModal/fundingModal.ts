import { autoinject } from "aurelia-framework";
import "./fundingModal.scss";
import { DialogController } from "aurelia-dialog";
import { DealTokenSwap } from "../../../entities/DealTokenSwap";

@autoinject
export class FundingModal {
  deal: DealTokenSwap;

  constructor(public controller: DialogController) {
  }

  public activate(model: { deal: DealTokenSwap }): void {
    this.deal = model.deal;
  }
}
