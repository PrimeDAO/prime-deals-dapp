import { EventType } from "./constants";
import { EventConfigTransaction } from "./GeneralEvents";
import { Utils } from "services/utils";
import { TransactionResponse, TransactionReceipt } from "@ethersproject/providers";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { EthereumService, Hash } from "services/EthereumService";

@autoinject
export default class TransactionsService {

  private static blocksToConfirm = 1;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService,
    private utils: Utils,
  ) { }

  public async send(methodCall: () => Promise<TransactionResponse>): Promise<TransactionReceipt> {
    let receipt: TransactionReceipt;
    try {
      this.eventAggregator.publish(EventType.TransactionSending);
      const response = await methodCall();
      this.eventAggregator.publish(EventType.TransactionSent, response);
      receipt = await response.wait(1);
      this.eventAggregator.publish(EventType.TransactionMined, { message: "Transaction was mined", receipt });
      receipt = await response.wait(TransactionsService.blocksToConfirm);
      this.eventAggregator.publish(EventType.TransactionConfirmed, new EventConfigTransaction("Transaction was confirmed", receipt),
      );
      return receipt;
    } catch (ex) {
      this.eventAggregator.publish(EventType.TransactionFailed, ex);
      return null;
    }
  }

  public getEtherscanLink(txHash: Hash): string {
    return this.ethereumService.getEtherscanLink(txHash, true);
  }
}

export { TransactionResponse } from "@ethersproject/providers";
export { TransactionReceipt } from "@ethersproject/providers";
