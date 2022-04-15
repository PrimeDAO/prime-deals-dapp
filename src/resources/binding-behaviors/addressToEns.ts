import { autoinject } from "aurelia-framework";
import { EnsService } from "services/EnsService";
import { Address } from "services/EthereumService";

@autoinject
export class AddressToEnsBindingBehavior {
  constructor(
    private ensService: EnsService,
  ) {
  }

  public bind(binding, _source) {
    binding.originalUpdateTarget = binding.updateTarget;
    binding.updateTarget = (address: Address) => {
      this.ensService.getEnsForAddress(address)
        .then(ens => binding.originalUpdateTarget(ens));
    };
  }

  public unbind(binding) {
    binding.updateTarget = binding.originalUpdateTarget;
    binding.originalUpdateTarget = null;
  }
}
