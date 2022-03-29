import { EthereumService } from "services/EthereumService";
import { autoinject, bindable, containerless} from "aurelia-framework";
import "./etherscan-button.scss";
import { Utils } from "services/utils";

@containerless()
@autoinject()
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
