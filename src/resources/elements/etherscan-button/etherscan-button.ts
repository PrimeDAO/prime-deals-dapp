import { EthereumService } from "services/EthereumService";
import "./etherscan-button.scss";
import { Utils } from "services/utils";
import { containerless, bindable } from "aurelia";

@containerless()
export class EtherscanButton {
  @bindable hrefText?:string;
  @bindable address:string;
  @bindable isTransaction:boolean;
  constructor(private readonly ethereumService:EthereumService ) {
    // you can inject the element or any DI in the constructor
  }

  public gotoEtherscan = (): void => {
    Utils.goto(this.ethereumService.getEtherscanLink(this.address, this.isTransaction));
  };

}
