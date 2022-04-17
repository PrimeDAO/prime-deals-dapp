import { autoinject } from "aurelia-framework";
import { EnsService } from "services/EnsService";

@autoinject
export class EnsToAddressBindingBehavior {
  constructor(
    private ensService: EnsService,
  ) {
  }

  /**
   * Tries to convert input ens to an address.  If can't convert or is already
   * an address, then does nothing.
   * @param binding
   * @param _source
   */
  public bind(binding, _source) {
    binding.originalUpdateTarget = binding.updateTarget;
    binding.updateTarget = (ens: string) => {
      this.ensService.getAddressForEns(ens)
        .then(address => {
          if (address?.length) {
            binding.originalUpdateTarget(address);
          }
          else {
            binding.originalUpdateTarget("");
          }
        });
    };
  }

  public unbind(binding) {
    binding.updateTarget = binding.originalUpdateTarget;
    binding.originalUpdateTarget = null;
  }
}
