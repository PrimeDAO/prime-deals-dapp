import { autoinject } from "aurelia-framework";
import { EnsService } from "services/EnsService";

@autoinject
export class EnsToAddressBindingBehavior {
  constructor(
    private ensService: EnsService,
  ) {
  }

  public bind(binding, _source, ensOnly = false) {
    binding.originalUpdateTarget = binding.updateTarget;
    binding.updateTarget = (ens: string) => {
      this.ensService.getAddressForEns(ens, ensOnly)
        .then(address => binding.originalUpdateTarget(address));
    };
  }

  public unbind(binding) {
    binding.updateTarget = binding.originalUpdateTarget;
    binding.originalUpdateTarget = null;
  }
}
