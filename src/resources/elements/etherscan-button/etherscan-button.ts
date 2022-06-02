import { Utils } from "services/utils";
import { containerless, bindable } from "aurelia";
import { IEthereumService } from "services";

@containerless()
export class EtherscanButton {
  @bindable hrefText?:string;
  @bindable address:string;
  @bindable isTransaction:boolean;
  constructor(@IEthereumService private readonly ethereumService: IEthereumService) {
    // you can inject the element or any DI in the constructor
  }

  public gotoEtherscan = (): void => {
    Utils.goto(this.ethereumService.getEtherscanLink(this.address, this.isTransaction));
  };

}
