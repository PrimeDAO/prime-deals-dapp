/* eslint-disable no-bitwise */
import { DialogController } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";
import "./ppopup-modal.scss";

export enum ShowButtonsEnum {
  Primary = 0x1,
  Secondary = 0x2,
}

@autoinject
export class PPopupModal {

  // private model: IPopupModalModel;
  private buttons: ShowButtonsEnum;
  private primaryButton: HTMLElement;
  private secondaryButton: HTMLElement;
  showCancelButton: boolean;
  showOkButton: boolean;
  buttonTextPrimary?: string;
  buttonTextSecondary?: string;
  message: string;
  header: string;

  constructor(private controller: DialogController) { }

  public activate(model: IPopupModalModel): void {
    this.buttons = model.buttons ?? ShowButtonsEnum.Primary;
    this.showOkButton = !!(this.buttons & ShowButtonsEnum.Primary);
    this.showCancelButton = !!(this.buttons & ShowButtonsEnum.Secondary);
    this.buttonTextPrimary = model.buttonTextPrimary ?? "OK";
    this.buttonTextSecondary = model.buttonTextSecondary ?? "CANCEL";
    this.message = model.message;
    this.header = model.header ?? "Prime Deals";
  }

  public attached(): void {
    // attach-focus doesn't work
    if (this.buttons & ShowButtonsEnum.Primary) {
      this.primaryButton.focus();
    }
  }
}

export interface IPopupModalModel {
  message: string;
  header?: string,
  buttons?: ShowButtonsEnum;
  buttonTextPrimary?: string;
  buttonTextSecondary?: string;
}
