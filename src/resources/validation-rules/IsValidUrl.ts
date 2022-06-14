import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { Utils } from "../../services";

export class IsValidUrl extends BaseValidationRule {
  messageKey = "Please enter a valid url";

  public execute(value: any, _object?: IValidateable): boolean {
    return Utils.isValidUrl(value);
  }
}
