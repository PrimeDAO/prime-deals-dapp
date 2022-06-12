import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { EnsService } from "../../services";

export class IsEthAddressOrEns extends BaseValidationRule {

  constructor(public ensService: EnsService) {
    super("Please enter a valid ethereum address or ENS");
  }

  public execute(value: any, _object?: IValidateable) {
    return this.ensService.getAddressForEns(value).then(address => !!address);
  }
}
