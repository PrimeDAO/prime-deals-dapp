import { bindable } from "aurelia-typed-observable-plugin";
import "./tokenDetails.scss";
import { IToken } from "../../../../entities/DealRegistrationTokenSwap";
import { autoinject, bindingMode } from "aurelia-framework";
import { AureliaHelperService } from "../../../../services/AureliaHelperService";
import { TokenService } from "../../../../services/TokenService";
import {
  validateTrigger,
  ValidationController,
  ValidationControllerFactory,
  ValidationRules,
} from "aurelia-validation";
import { PrimeRenderer } from "../../../../resources/elements/primeDesignSystem/validation/primeRenderer";
import { Validation } from "../../../../services/ValidationService";
import { Utils } from "../../../../services/utils";

@autoinject
export class TokenDetails {
  @bindable token: IToken;
  @bindable({defaultBindingMode: bindingMode.fromView}) onDelete: () => void;
  @bindable({defaultBindingMode: bindingMode.fromView}) form: ValidationController;

  viewMode: "edit" | "view" = "edit";
  tokenInfoLoading = false;
  showTokenDetails = false;
  saving = false;
  validTokenLogoURI = true;
  tokenDetailsNotFound = {
    name: false,
    symbol: false,
    decimals: false,
  };

  valid = true;

  constructor(
    private aureliaHelperService: AureliaHelperService,
    private tokenService: TokenService,
    private validationControllerFactory: ValidationControllerFactory,
  ) {

    this.form = this.validationControllerFactory.createForCurrentScope();
    this.form.validateTrigger = validateTrigger.change;
    this.form.addRenderer(new PrimeRenderer);
  }

  attached() {
    this.addValidation();
    this.watchVestedAmount();

    this.form.subscribe(result => {
      if (result.type === "validate") {
        this.valid = result.controllerValidateResult.valid;
      }
    });
  }

  async getTokenInfo(address: string) {
    this.showTokenDetails = false;
    this.tokenInfoLoading = true;

    if (!Utils.isAddress(address) || !await this.tokenService.isERC20Token(address)) {
      this.tokenInfoLoading = false;
      return;
    }

    try {
      const tokenInfo = await this.tokenService
        .getTokenInfoFromAddress(address)
        .finally(() => this.tokenInfoLoading = false);

      if (tokenInfo.logoURI === TokenService.DefaultLogoURI) {
        tokenInfo.logoURI = "";
      }

      if (!tokenInfo.logoURI) {
        await this.tokenService.getTokenGeckoInfo(tokenInfo);
      }

      this.token.name = tokenInfo.name;
      this.token.symbol = tokenInfo.symbol;
      this.token.decimals = tokenInfo.decimals;
      this.token.logoURI = tokenInfo.logoURI;

      this.tokenDetailsNotFound.name = !tokenInfo.name;
      this.tokenDetailsNotFound.symbol = !tokenInfo.symbol;
      this.tokenDetailsNotFound.decimals = !tokenInfo.decimals;
    } catch (error) {
      this.token.name = undefined;
      this.token.logoURI = undefined;
      this.token.symbol = undefined;
      this.token.decimals = undefined;
    }

    this.showTokenDetails = true;
  }

  async save(): Promise<void> {
    this.saving = true;
    const result = await this.form.validate().finally(() => this.saving = false);
    if (!result.valid) {
      return;
    }
    this.viewMode = "view";
  }

  logoLoaded(valid: boolean) {
    this.validTokenLogoURI = valid;
  }

  checkURL() {
    this.logoLoaded(Utils.isValidUrl(encodeURI(this.token.logoURI)));
  }

  private watchVestedAmount() {
    this.aureliaHelperService.createPropertyWatch(this.token, "vestedTransfer", newValue => {
      if (newValue === 0) {
        this.token.vestedFor = undefined;
        this.token.cliffOf = undefined;
      }
    });
  }

  private addValidation() {
    ValidationRules.customRule(
      "isValidIERC20Address",
      (value) => this.tokenService.isERC20Token(value),
      "Please enter a valid IERC20 address",
    );

    this.viewMode = this.token.address ? "view" : "edit";

    const rules = ValidationRules
      .ensure<IToken, string>(data => data.address)
      .required()
      .satisfiesRule(Validation.isETHAddress)
      .then()
      .satisfiesRule("isValidIERC20Address")
      .ensure<number>(data => data.amount)
      .required()
      .min(0)
      .ensure<number>(data => data.vestedFor)
      .required()
      .when(data => data.vestedTransfer !== 0)
      .withMessage("Please select a vested period")
      .min(0)
      .ensure<number>(data => data.cliffOf)
      .required()
      .when(data => data.vestedTransfer !== 0)
      .withMessage("Please select a cliff period (can be 0)")
      .min(0)
      .rules;

    this.form.addObject(this.token, rules);
  }
}
