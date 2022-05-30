/* eslint-disable no-bitwise */
import { inject, IDialogController } from "aurelia";
import { IPopupModalModel, ShowButtonsEnum } from "resources/elements/primeDesignSystem/ppopup-modal/ppopup-modal";

/**
 * puts up a straight ppopup-modal
 */
@inject()
export class Alert {
  className: string;
  buttons: ShowButtonsEnum;
  buttonTextPrimary?: string;
  buttonTextSecondary?: string;
  message: string;
  header: string;
  confetti: boolean;
  data: Record<string, unknown>;

  constructor(@IDialogController private $dialog: IDialogController) { }

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
