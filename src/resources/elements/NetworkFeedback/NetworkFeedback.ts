import { EthereumService, IEthereumService } from "services/EthereumService";
import { containerless, customElement } from "aurelia";

@customElement("networkfeedback")
@containerless
export class NetworkFeedback {

  private network: string;

  constructor(@IEthereumService private ethereumService: IEthereumService,
  ) {
    this.network = EthereumService.targetedNetwork;
  }
}
