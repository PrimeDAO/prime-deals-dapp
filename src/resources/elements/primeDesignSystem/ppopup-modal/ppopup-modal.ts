/* eslint-disable no-bitwise */
import { autoinject, customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./ppopup-modal.scss";

export enum ShowButtonsEnum {
  Primary = 0x1,
  Secondary = 0x2,
}

@autoinject
@customElement("ppopup-modal")
export class PPopupModal {

  @bindable buttons: ShowButtonsEnum;
  @bindable message: string;
  @bindable header: string;
  @bindable buttonTextPrimary?: string;
  @bindable buttonTextSecondary?: string;
  @bindable primaryClick: () => void;
  @bindable secondaryClick: () => void;

  private primaryButton: HTMLElement;
  showCancelButton: boolean;
  showOkButton: boolean;

  public attached(): void {
    this.showOkButton = !!(this.buttons & ShowButtonsEnum.Primary);
    this.showCancelButton = !!(this.buttons & ShowButtonsEnum.Secondary);
    this.buttonTextPrimary = this.buttonTextPrimary ?? "OK";
    this.buttonTextSecondary = this.buttonTextSecondary ?? "CANCEL";
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
