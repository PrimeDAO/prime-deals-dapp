import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { Utils } from "../../services";

export class IsEthAddress extends BaseValidationRule {
  messageKey = "Please enter a valid ethereum address";

  public execute(value: any, _object?: IValidateable): boolean {
    return Utils.isAddress(value);
  }
}
