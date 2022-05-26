import { EthereumService } from "services/EthereumService";
import { containerless, customElement } from "aurelia";

@customElement("networkfeedback")
@containerless
export class NetworkFeedback {

  private network: string;

  constructor(private ethereumService: EthereumService) {
    this.network = EthereumService.targetedNetwork;
  }
}
