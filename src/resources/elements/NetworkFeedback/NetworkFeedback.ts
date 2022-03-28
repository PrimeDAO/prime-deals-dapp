import { autoinject, containerless, customElement } from "aurelia-framework";
import { EthereumService } from "services/EthereumService";
import { IEthereumService } from "services/IEthereumService";

@autoinject
@containerless
@customElement("networkfeedback")

export class NetworkFeedback {

  private network: string;

  constructor(private ethereumService: IEthereumService) {
    this.network = EthereumService.targetedNetwork;
  }
}
