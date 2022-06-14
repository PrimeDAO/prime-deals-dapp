import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { Utils } from "../../services";

export class IsEmail extends BaseValidationRule {
  messageKey = "Please enter a valid email address";

  public execute(value: any, _object?: IValidateable): boolean {
    return Utils.isValidEmail(value, true);
  }
}
