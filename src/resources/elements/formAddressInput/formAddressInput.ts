import { bindingMode } from "aurelia-binding";
import { TaskQueue, autoinject } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
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
@autoinject
export class FormAddressInput {
  @bindable.booleanAttr disabled = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value: string;
  @bindable.string label;
  @bindable.string labelInfo;
  @bindable.string labelDescription;
  @bindable.booleanAttr showCounter;
  @bindable.number maxLength;
  @bindable validationMessage;
  @bindable validationState?: ValidationState;
  @bindable.string({ defaultbindingMode: bindingMode.twoWay }) ens = "";

  constructor(
    private ensService: EnsService,
    private taskQueue: TaskQueue,
  ) {
  }

  valueChanged(newValue: string): void {
    this.taskQueue.queueMicroTask(async () => {
      if (newValue?.trim().length) {
        if (Utils.isAddress(newValue)) {
          this.ens = await this.ensService.getEnsForAddress(newValue);
        } else {
          const address = await this.ensService.getAddressForEns(newValue);
          if (address) {
            this.ens = newValue;
            this.value = address;
          } else {
            this.ens = "";
          }
        }
      } else {
        this.ens = "";
      }
    });
  }
}
