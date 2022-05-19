import { EventConfigTransaction } from "./GeneralEvents";
import { Utils } from "./utils";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { EthereumService, Hash } from "./EthereumService";
import { EventAggregator, inject } from "aurelia";

@inject()
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
      this.eventAggregator.publish("transaction.sending");
      const response = await methodCall();
      this.eventAggregator.publish("transaction.sent", response);
      receipt = await response.wait(1);
      this.eventAggregator.publish("transaction.mined", { message: "Transaction was mined", receipt });
      receipt = await response.wait(TransactionsService.blocksToConfirm);
      this.eventAggregator.publish("transaction.confirmed", new EventConfigTransaction("Transaction was confirmed", receipt),
      );
      return receipt;
    } catch (ex) {
      this.eventAggregator.publish("transaction.failed", ex);
      return null;
    }
  }

  public getEtherscanLink(txHash: Hash): string {
    return this.ethereumService.getEtherscanLink(txHash, true);
  }
}

export { TransactionResponse } from "@ethersproject/providers";
export { TransactionReceipt } from "@ethersproject/providers";
