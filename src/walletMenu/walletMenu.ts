import { bindable, BindingMode, inject, PLATFORM } from "aurelia";
import { EthereumService } from "../services/EthereumService";
import { TokenService } from "../services/TokenService";
import { ContractNames, ContractsService } from "../services/ContractsService";
import { Utils } from "../services/utils";

@inject()
export class WalletMenu {
  @bindable({mode: BindingMode.twoWay}) showing = false;
  container: HTMLElement;
  primeAddress: string;
  metamaskHasPrimeToken: boolean;
  /**
   * doing it with bind is the only way I can find that properly removes the event handlers
   */
  thisClickHandler = this.handleClick.bind(this);
  thisEscHandler = this.handleEsc.bind(this);

  constructor(
    private ethereumService: EthereumService,
    private tokenService: TokenService,
  ) {
    this.primeAddress = ContractsService.getContractAddress(ContractNames.PRIME);
  }

  showingChanged(show: boolean, a): void {
    if (show) {
      this.metamaskHasPrimeToken = this.ethereumService.getMetamaskHasToken(this.primeAddress);
      PLATFORM.taskQueue.queueTask(() => {
        document.addEventListener("click", this.thisClickHandler);
        document.addEventListener("keydown", this.thisEscHandler);
      })
    } else {
      document.removeEventListener("click", this.thisClickHandler);
      document.removeEventListener("keydown", this.thisEscHandler);
    }
  }

  handleClick(event: MouseEvent): void {
    const withinBoundaries = event.composedPath().includes(this.container);

    if (!withinBoundaries && this.showing) {
      this.showing = false;
    }
  }

  handleEsc(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.showing = false;
      event.preventDefault();
    }
  }

  disconnect(): void {
    this.ethereumService.disconnect({code: 0, message: "User requested"});
    this.showing = false;
  }

  async addTokenToWallet(): Promise<void> {
    const tokenInfo = await this.tokenService.getTokenInfoFromAddress(this.primeAddress);
    this.metamaskHasPrimeToken = await this.ethereumService.addTokenToMetamask(
      tokenInfo.address,
      tokenInfo.symbol,
      tokenInfo.decimals,
      tokenInfo.logoURI,
    );
  }

  gotoEtherscan(): void {
    Utils.goto(this.ethereumService.getEtherscanLink(this.ethereumService.defaultAccountAddress));
    this.showing = false;
  }

  copyAddress(): void {
    this.showing = false;
  }
}
