import { autoinject } from "aurelia-framework";
import { EnsService } from "services/EnsService";
import { Address } from "services/EthereumService";
import { Utils } from "services/utils";

@autoinject
export class SwapAddressAndEnsBindingBehavior {
  constructor(
    private ensService: EnsService,
  ) {
  }

  /**
   * If address, convert to ens.  If not address, convert to address.
   * Otherwise, nothing.
   * @param binding
   * @param _source
   */
  public bind(binding, _source) {
    binding.originalUpdateTarget = binding.updateTarget;
    binding.updateTarget = (input: Address) => {
      if (Utils.isAddress(input)) {
        this.ensService.getEnsForAddress(input)
          .then(ens => {
            if (ens?.length) {
              binding.originalUpdateTarget(ens);
            }
            else {
              binding.originalUpdateTarget("");
            }
          });
      } else {
        this.ensService.getAddressForEns(input)
          .then(address => {
            if (address?.length) {
              binding.originalUpdateTarget(address);
            }
            else {
              binding.originalUpdateTarget("");
            }
          });
      }
    };
  }

  public unbind(binding) {
    binding.updateTarget = binding.originalUpdateTarget;
    binding.originalUpdateTarget = null;
  }
}
