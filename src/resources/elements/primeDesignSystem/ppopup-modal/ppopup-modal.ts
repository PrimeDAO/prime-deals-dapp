/* eslint-disable no-bitwise */
import { autoinject, customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./ppopup-modal.scss";
// does the confetti
import "@stackoverflow/stacks/dist/css/stacks.min.css";
import { AureliaHelperService } from "services/AureliaHelperService";

export enum ShowButtonsEnum {
  Primary = 0x1,
  Secondary = 0x2,
  Both = 0x3,
}

@autoinject
@customElement("ppopup-modal")
export class PPopupModal {
  @bindable data: Record<string, unknown>;
  @bindable className: string;
  @bindable buttons: ShowButtonsEnum;
  @bindable message: string;
  @bindable header: string;
  @bindable buttonTextPrimary?: string;
  @bindable buttonTextSecondary?: string;
  @bindable primaryClick: () => void;
  @bindable secondaryClick: () => void;
  @bindable.booleanAttr confetti = false;

  private primaryButton: HTMLElement;
  showCancelButton: boolean;
  showOkButton: boolean;
  body: HTMLElement;

  constructor(private aureliaHelperService: AureliaHelperService) {}

  public attached(): void {
    this.buttons = this.buttons ?? ShowButtonsEnum.Primary;
    this.showOkButton = !!(this.buttons & ShowButtonsEnum.Primary);
    this.showCancelButton = !!(this.buttons & ShowButtonsEnum.Secondary);
    this.buttonTextPrimary = this.buttonTextPrimary ?? "OK";
    this.buttonTextSecondary = this.buttonTextSecondary ?? "CANCEL";
    // attach-focus doesn't work
    if (this.buttons & ShowButtonsEnum.Primary) {
      this.primaryButton.focus();
    }

    this.body.innerHTML= this.message;
    this.aureliaHelperService.enhanceElement(this.body, this, true);
  }
}

export interface IPopupModalModel {
  data?: Record<string, unknown>;
  className?: string;
  message: string;
  header?: string,
  buttons?: ShowButtonsEnum;
  buttonTextPrimary?: string;
  buttonTextSecondary?: string;
  confetti?: boolean;
}
