import { customElement, bindable, BindingMode } from "aurelia";
import { toBoolean } from "resources/binding-behaviours";
import { EthereumService } from "services/EthereumService";
import "./EtherscanLink.scss";

@customElement("etherscanlink")
export class EtherscanLink {
  @bindable({ mode: BindingMode.oneTime }) public address: string;
  @bindable({ mode: BindingMode.oneTime }) public text?: string;
  @bindable({ mode: BindingMode.oneTime }) public type: string;
  /**
   * set add classes on the text
   */
  @bindable({ mode: BindingMode.oneTime }) public css: string;
  @bindable({ set: toBoolean, type: Boolean, mode: BindingMode.oneTime }) public hideClipboardButton: boolean;
  /**
   * bootstrap config for a tooltip
   */
  // @bindable({ defaultBindingMode: bindingMode.oneTime }) public tooltip?: any;

  private copyMessage: string;
  private internal = false;

  private get networkExplorerUri(): string {
    return this.ethereumService.getEtherscanLink(this.address, this.type === "tx");
  }

  constructor(
    private ethereumService: EthereumService,
  ) { }

  public attached(): void {
    if (this.type === "tx") {
      this.copyMessage = "Hash has been copied to the clipboard";
    } else {
      this.copyMessage = "Address has been copied to the clipboard";
    }
  }
}
