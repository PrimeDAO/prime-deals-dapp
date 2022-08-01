import { toBoolean } from "resources/binding-behaviours";
// does the confetti
import "/src/styles/confetti.css";
import { AureliaHelperService } from "services/AureliaHelperService";
import { bindable, customElement } from "aurelia";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "resources/temporary-code";

export enum ShowButtonsEnum {
  Primary = 0x1,
  Secondary = 0x2,
  Both = 0x3,
}

@customElement("ppopup-modal")
@processContent(autoSlot)
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
  @bindable({ set: toBoolean }) confetti = false;

  private primaryButton: HTMLElement;
  showCancelButton: boolean;
  showOkButton: boolean;

  constructor(private aureliaHelperService: AureliaHelperService) { }

  public attached(): void {
    /* eslint-disable no-bitwise */
    this.buttons = this.buttons ?? ShowButtonsEnum.Primary;
    this.showOkButton = !!(this.buttons & ShowButtonsEnum.Primary);
    this.showCancelButton = !!(this.buttons & ShowButtonsEnum.Secondary);
    this.buttonTextPrimary = this.buttonTextPrimary ?? "OK";
    this.buttonTextSecondary = this.buttonTextSecondary ?? "CANCEL";
    // attach-focus doesn't work
    if (this.buttons && ShowButtonsEnum.Primary) {
      this.primaryButton.focus();
    }
  }
}

export interface IPopupModalModel {
  data?: Record<string, unknown>; //have to be able to pass data to this model in case the modal needs to use methods or data from the caller like for the etherscan wallet modal in swap
  className?: string;
  message: string;
  header?: string,
  buttons?: ShowButtonsEnum;
  buttonTextPrimary?: string;
  buttonTextSecondary?: string;
  confetti?: boolean;
}
