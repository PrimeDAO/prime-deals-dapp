import { bindable, BindingMode, TaskQueue } from "aurelia";
import { toBoolean } from "resources/binding-behaviours";
import { ValidationState } from "resources/elements/primeDesignSystem/types";
import { EnsService } from "services/EnsService";
import { Utils } from "services/utils";
import "./formAddressInput.scss";
/**
 * an input that allows entry of either ENS or address.  If an ENS is entered,
 * then it converts to the address and displays that in the input and
 * displays the ENS below the input.
 * The `value` property can be input as either ENS of an address, but
 * will always be return as the address.
 * The ens will be output using the `ens` bindable propery.
 */
export class FormAddressInput {
  @bindable({set: toBoolean, type: Boolean }) disabled = false;
  @bindable({mode: BindingMode.twoWay}) value: string;
  @bindable label;
  @bindable labelInfo;
  @bindable labelDescription;
  @bindable({set: toBoolean, type: Boolean }) showCounter;
  @bindable maxLength;
  @bindable validationMessage;
  @bindable validationState?: ValidationState;
  @bindable({ mode: BindingMode.twoWay }) ens = "";

  ignoreNewValue = false;

  constructor(
    private ensService: EnsService,
    private taskQueue: TaskQueue,
  ) {
  }

  valueChanged(newValue: string): void {
    if (!this.ignoreNewValue) {
      if (newValue?.trim().length) {
        this.ens = "Searching for ENS...";
        this.taskQueue.queueTask(async () => {
          if (Utils.isAddress(newValue)) {
            this.ens = (await this.ensService.getEnsForAddress(newValue)) ?? "";
          } else {
            const address = await this.ensService.getAddressForEns(newValue);
            if (address) {
              this.ens = newValue;
              this.ignoreNewValue = true;
              this.value = address;
            } else {
              this.ens = "";
            }
          }
        });
      } else {
        this.ens = "";
      }
    } else {
      this.ignoreNewValue = false;
    }
  }
}
