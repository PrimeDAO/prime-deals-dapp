import { bindable, BindingMode, customElement } from "aurelia";
import { toBoolean } from "resources/binding-behaviours";
import { IEthereumService } from "services/EthereumService";
import { EnsService, Utils } from "../../../services";

@customElement("etherscanlink")
export class EtherscanLink {
  @bindable({mode: BindingMode.oneTime}) public address: string;
  @bindable({mode: BindingMode.oneTime}) public text?: string;
  @bindable({mode: BindingMode.oneTime}) public type: string;
  /**
   * set add classes on the text
   */
  @bindable({mode: BindingMode.oneTime}) public css: string;
  @bindable({set: toBoolean, type: Boolean, mode: BindingMode.oneTime}) public hideClipboardButton: boolean;
  /**
   * bootstrap config for a tooltip
   */
    // @bindable({ defaultBindingMode: bindingMode.oneTime }) public tooltip?: any;

  private copyMessage: string;
  private internal = false;
  ens?: string;

  private get networkExplorerUri(): string {
    return this.ethereumService.getEtherscanLink(this.address, this.type === "tx");
  }

  constructor(
    @IEthereumService private ethereumService: IEthereumService,
    private ensService: EnsService,
  ) { }

  public attached(): void {
    if (this.type === "tx") {
      this.copyMessage = "Hash has been copied to the clipboard";
    } else {
      this.copyMessage = "Address has been copied to the clipboard";
    }
  }

  binding() {
    this.addressChanged(this.address);
  }

  async addressChanged(newValue: string) {

    if (Utils.isAddress(newValue)) {
      this.ens = (await this.ensService.getEnsForAddress(newValue)) ?? "";
    } else {
      const address = await this.ensService.getAddressForEns(newValue);
      if (address) {
        this.ens = newValue;
      } else {
        this.ens = "";
      }
    }

  }
}
