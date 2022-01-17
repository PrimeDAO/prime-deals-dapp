import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, customElement } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import { EthereumService } from "../../../services/EthereumService";

@autoinject
@customElement("usersaddress")
export class UsersAddress {

  @bindable.string overrideAddress?: string;
  @bindable.booleanAttr small?: boolean;
  @bindable.booleanAttr showEns?: boolean;

  private usersAddress: string;
  private ens?: string;

  constructor(
    private eventAggregator: EventAggregator,
    private ethereumService: EthereumService) {
    this.eventAggregator.subscribe("Network.Changed.Account", () => { this.initialize(); });
  }

  attached(): void {
    this.initialize();
  }

  overrideAddressChanged() {
    this.initialize(this.overrideAddress);
  }

  private async initialize(address = this.ethereumService.defaultAccountAddress) {
    this.usersAddress = address;
    if (this.usersAddress && this.showEns) {
      this.ens = await this.ethereumService.walletProvider.lookupAddress(this.usersAddress);
    }
  }
}
