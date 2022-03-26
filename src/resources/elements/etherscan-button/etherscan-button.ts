import { EthereumService } from "services/EthereumService";
import { autoinject, bindable, containerless} from "aurelia-framework";
import "./etherscan-button.scss";
import { Utils } from "services/utils";

@containerless()
@autoinject()
export class EtherscanButton {
  @bindable hrefText?:string;
  @bindable address:string;
  constructor(private readonly ethereumService:EthereumService ) {
    // you can inject the element or any DI in the constructor
  }

  public gotoEtherscan = (address: string, tx = false): void => {
    Utils.goto(this.ethereumService.getEtherscanLink(address, tx));
  };

}
