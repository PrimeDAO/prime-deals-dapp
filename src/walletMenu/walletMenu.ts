import { TransactionHistoryService } from "services/TransactionHistoryService";
import { autoinject, bindingMode } from "aurelia-framework";
import { BrowserStorageService } from "services/BrowserStorageService";
import { EthereumService } from "services/EthereumService";
import { bindable } from "aurelia-typed-observable-plugin";
import "./walletMenu.scss";

@autoinject
export class WalletMenu {

  @bindable.booleanAttr({ defaultBindingMode: bindingMode.twoWay }) showing = false;
  container: HTMLElement;
  /**
   * doing it with bind is the only way I can find that properly removes the event handlers
   */
  thisClickHandler = this.handleClick.bind(this)
  thisEscHandler = this.handleEsc.bind(this)

  constructor(
    private ethereumService: EthereumService,
    private storageService: BrowserStorageService,
    private tansactionHistoryService: TransactionHistoryService,
  ) { }

  showingChanged(show: boolean): void {
    if (show) {
      document.addEventListener("click", this.thisClickHandler);
      document.addEventListener("keydown", this.thisEscHandler);
    } else {
      document.removeEventListener("click", this.thisClickHandler);
      document.removeEventListener("keydown", this.thisEscHandler);
    }
  }

  handleClick(event: MouseEvent): void {
    const withinBoundaries = event.composedPath().includes(this.container);

    if (!withinBoundaries) {
      this.showing = false;
    }
  }

  handleEsc(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.showing = false;
      event.preventDefault();
    }
  }
}
