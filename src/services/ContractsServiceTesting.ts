import { EventAggregator } from "aurelia-event-aggregator";
import { ContractsService } from "./ContractsService";
import { EthereumService } from "./EthereumService";

export class ContractsServiceTesting extends ContractsService {
  constructor(
    eventAggregator: EventAggregator,
    ethereumService: EthereumService) {
    super(eventAggregator, ethereumService);
  }

  public createProvider(): any {
    let signerOrProvider;
    // @ts-ignore - is private in base class
    if (this.accountAddress && this.networkInfo?.provider) {
      // @ts-ignore - is private in base class
      signerOrProvider = this.ethereumService.getDefaultSigner();
    } else {
      // @ts-ignore - is private in base class
      signerOrProvider = this.ethereumService.readOnlyProvider;
    }
    return signerOrProvider;
  }
}
