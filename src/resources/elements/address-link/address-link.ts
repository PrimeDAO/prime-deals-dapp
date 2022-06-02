import { bindable, containerless } from "aurelia";
import { IEthereumService } from "services/EthereumService";
import { Utils } from "services/utils";
@containerless()
export class AddressLink {
  @bindable address: string;
  @bindable isTransaction = false;
  @bindable showArrowIcon = true;
  @bindable showCopyIcon = true;
  @bindable linkText: string;
  @bindable textClickable = true;
  @bindable showArrowInsideLink = false;
  @bindable showTooltip = true;
  constructor(@IEthereumService private readonly ethereumService: IEthereumService) {
    // you can inject the element or any DI in the constructor
  }
  public gotoEtherscan = (): void => {
    Utils.goto(this.ethereumService.getEtherscanLink(this.address, this.isTransaction));
  };
}
