import { bindable, customElement, IAuSlotsInfo } from "aurelia";

@customElement("pinput-group")
export class PInputGroup {
  @bindable disabled = false;

  constructor(
    @IAuSlotsInfo public readonly slotInfo: IAuSlotsInfo,
  ) {
  }

}
