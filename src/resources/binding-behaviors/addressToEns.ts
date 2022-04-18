import { autoinject } from "aurelia-framework";
import { EnsService } from "services/EnsService";
import { Address } from "services/EthereumService";
import { Utils } from "services/utils";

@autoinject
export class AddressToEnsBindingBehavior {
  constructor(
    private ensService: EnsService,
  ) {
  }

  /**
   * Tries to convert input address to ens.  If can't convert then returns the address
   * @param binding
   * @param _source
   */
  public bind(binding, _source) {
    binding.originalUpdateTarget = binding.updateTarget;
    binding.updateTarget = (address: Address) => {
      if (!Utils.isAddress(address)) {
        binding.originalUpdateTarget(address);
      } else {
        this.ensService.getEnsForAddress(address)
          .then(ens => {
            if (ens?.length) {
              binding.originalUpdateTarget(ens);
            }
            else {
              binding.originalUpdateTarget(address);
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
