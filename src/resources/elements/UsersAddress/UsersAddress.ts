import { EventType } from "./../../../services/constants";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { EthereumService } from "../../../services/EthereumService";

@autoinject
@customElement("usersaddress")
export class UsersAddress {

  @bindable.booleanAttr small?: boolean;
  @bindable.booleanAttr showEns?: boolean;

  private usersAddress: string;
  private ens?: string;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService) {
    this.eventAggregator.subscribe(EventType.NetworkChangedAccount, () => { this.initialize(); });
  }

  attached(): void {
    this.initialize();
  }

  private async initialize() {
    this.usersAddress = this.ethereumService.defaultAccountAddress;
    if (this.usersAddress && this.showEns && this.ethereumService.walletProvider) {
      this.ens = await this.ethereumService.walletProvider.lookupAddress(this.usersAddress);
    }
  }
}
