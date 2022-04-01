/* eslint-disable no-bitwise */
import { DialogController } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";
import { IPopupModalModel, ShowButtonsEnum } from "resources/elements/primeDesignSystem/ppopup-modal/ppopup-modal";

/**
 * puts up a straight ppopup-modal
 */
@autoinject
export class Alert {
  className: string;
  buttons: ShowButtonsEnum;
  buttonTextPrimary?: string;
  buttonTextSecondary?: string;
  message: string;
  header: string;
  confetti: boolean;
  data: Record<string, unknown>;

  constructor(private controller: DialogController) { }

  public activate(model: IPopupModalModel): void {
    this.data = model.data;
    this.className = model.className;
    this.buttons = model.buttons ?? ShowButtonsEnum.Primary;
    this.buttonTextPrimary = model.buttonTextPrimary ?? "OK";
    this.buttonTextSecondary = model.buttonTextSecondary ?? "CANCEL";
    this.message = model.message;
    this.header = model.header ?? "Prime Deals";
    this.confetti = !!model.confetti;
  }
}

export { IPopupModalModel as IAlertModel, ShowButtonsEnum } from "resources/elements/primeDesignSystem/ppopup-modal/ppopup-modal";
