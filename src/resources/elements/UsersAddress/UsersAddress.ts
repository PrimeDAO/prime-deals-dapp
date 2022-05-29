import { bindable, customElement, IEventAggregator } from "aurelia";
import { toBoolean } from "../../binding-behaviours";
import { EthereumService, IEthereumService } from "../../../services/EthereumService";
import { EnsService } from "../../../services/EnsService";

@customElement("usersaddress")
export class UsersAddress {

  @bindable({set: toBoolean}) small?: boolean;
  @bindable({set: toBoolean}) showEns?: boolean;

  private usersAddress: string;
  private ens?: string;

  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
    @IEthereumService private ethereumService: IEthereumService,
    private ensService: EnsService,
  ) {
    this.eventAggregator.subscribe("Network.Changed.Account", () => {
      this.initialize();
    });
  }

  attaching(): void {
    this.initialize();
  }

  private async initialize() {
    this.usersAddress = this.ethereumService.defaultAccountAddress;
    if (this.usersAddress && this.showEns) {
      this.ens = await this.ensService.getEnsForAddress(this.usersAddress);
    }
  }
}
