import { autoinject, bindable, containerless} from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { Utils } from "services/utils";
import "./address-link.scss";
@containerless()
@autoinject()
export class AddressLink {
  @bindable address:string;
  @bindable isTransaction = false;
  @bindable showArrowIcon = true;
  @bindable showCopyIcon = true;
  @bindable linkText: string;
  @bindable textClickable = true;
  @bindable showArrowInsideLink = false;
  @bindable showTooltip = true;
  constructor(private readonly ethereumService:EthereumService ) {
    // you can inject the element or any DI in the constructor
  }
  public gotoEtherscan = (): void => {
    Utils.goto(this.ethereumService.getEtherscanLink(this.address, this.isTransaction));
  };
}
