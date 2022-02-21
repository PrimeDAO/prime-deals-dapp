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
import { formatEther } from "ethers/lib/utils";

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

  async attached() {
    this.addValidation();
    this.watchTokenProperties();

    this.form.subscribe(result => {
      if (result.type === "validate") {
        this.valid = result.controllerValidateResult.valid;
      }
    });

    if (this.token.address) {
      await this.getTokenInfo(this.token.address);
    }
  }

  async getTokenInfo(address: string) {
    this.showTokenDetails = false;
    this.tokenInfoLoading = true;
    this.validTokenLogoURI = true;

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
        this.tokenInfoLoading = true;
        await this.tokenService.getTokenGeckoInfo(tokenInfo).finally(() => this.tokenInfoLoading = false);
      }

      this.token.name = tokenInfo.name;
      this.token.symbol = tokenInfo.symbol;
      this.token.decimals = tokenInfo.decimals;
      this.token.logoURI = tokenInfo.logoURI;
    } catch (error) {
      this.token.name = undefined;
      this.token.logoURI = undefined;
      this.token.symbol = undefined;
      this.token.decimals = undefined;
    }

    this.tokenDetailsNotFound.name = !this.token.name;
    this.tokenDetailsNotFound.symbol = !this.token.symbol;
    this.tokenDetailsNotFound.decimals = !this.token.decimals;

    this.tokenInfoLoading = false;
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

  private watchTokenProperties() {
    this.aureliaHelperService.createPropertyWatch(this.token, "vestedTransferAmount", newValue => {
      if (Number(newValue?.toString() ?? 0) === 0) {
        this.token.vestedFor = undefined;
        this.token.cliffOf = undefined;
      }
    });
    this.aureliaHelperService.createPropertyWatch(this.token, "vestedFor", () => {
      this.form.revalidateErrors();
      this.token.cliffOf = this.token.cliffOf ? Math.min(this.token.vestedFor, this.token.cliffOf) : this.token.cliffOf;
    });
    this.aureliaHelperService.createPropertyWatch(this.token, "address", () => {
      this.token.amount = undefined;
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
      .ensure<string>(data => data.amount)
      .required()
      .min(0)
      .ensure<string>(data => data.instantTransferAmount)
      .satisfies((value, data) => data.amount && Number(formatEther(value)) <= Number(formatEther(data.amount)))
      .when(data => Boolean(data.amount))
      .withMessage("Instant transfer amount can't ge bigger than Token Amount")
      .ensure<string>(data => data.vestedTransferAmount)
      .satisfies((value, data) => data.amount && Number(formatEther(value)) <= Number(formatEther(data.amount)))
      .when(data => Boolean(data.amount))
      .withMessage("Vested transfer amount can't ge bigger than Token Amount")
      .ensure<number>(data => data.vestedFor)
      .required()
      .when(data => Number(data.vestedTransferAmount?.toString() ?? 0) !== 0)
      .withMessage("Please select a vested period")
      .min(0)
      .ensure<number>(data => data.cliffOf)
      .required()
      .when(data => Number(data.vestedTransferAmount?.toString() ?? 0) !== 0)
      .withMessage("Please select a cliff period (can be 0)")
      .satisfies((value: number, data) => value <= data.vestedFor)
      .when(data => data.vestedFor >= 0)
      .withMessage("Cliff period needs to be smaller or equal to vested period")
      .min(0)
      .rules;

    this.form.addObject(this.token, rules);
  }
}
