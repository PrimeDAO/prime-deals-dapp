import { BaseValidationRule, IValidateable } from "@aurelia/validation";
import { TokenService } from "../../services";

export class IsValidIERC20Address extends BaseValidationRule {

  constructor(public tokenService: TokenService) {
    super("Please enter a valid ethereum address or ENS");
  }

  public execute(value: any, _object?: IValidateable) {
    return this.tokenService.isERC20Token(value).then(address => !!address);
  }
}
