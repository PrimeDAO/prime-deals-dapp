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
import { Validation } from "../../../../services/ValidationService";
import { Utils } from "../../../../services/utils";
import { NumberService } from "../../../../services/NumberService";
import { PrimeRenderer } from "../../../../resources/elements/primeDesignSystem/validation/primeRenderer";
import { WizardType } from "../../dealWizardTypes";
import { BigNumber } from "ethers";
import { ConsoleLogService } from "services/ConsoleLogService";

@autoinject
export class TokenDetails {
  @bindable token: IToken;
  @bindable wizardType: WizardType;
  @bindable({defaultBindingMode: bindingMode.fromView}) onDelete: () => void;
  @bindable({defaultBindingMode: bindingMode.fromView}) form: ValidationController;
  @bindable({defaultBindingMode: bindingMode.twoWay}) viewMode: "edit" | "view" = "edit";
  @bindable.boolean hideDeleteButton: boolean;
  @bindable onSaved?: () => void;

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
    private consoleLogService: ConsoleLogService,
    private tokenService: TokenService,
    private numberService: NumberService,
    private validationControllerFactory: ValidationControllerFactory,
  ) {
    this.form = this.validationControllerFactory.createForCurrentScope();
    this.form.validateTrigger = validateTrigger.change;
    this.form.addRenderer(new PrimeRenderer);

    ValidationRules.customRule(
      "isValidIERC20Address",
      (value) => this.tokenService.isERC20Token(value),
      "Please enter a valid IERC20 address",
    );
  }

  async attached() {
    this.addValidation();
    this.watchTokenProperties();

    this.viewMode = this.viewMode ?? "edit";

    this.form.subscribe(result => {
      if (result.type === "validate") {
        this.valid = result.controllerValidateResult.valid;
      }
    });

    if (this.token.address && (this.token.logoURI || this.token.name || this.token.decimals || this.token.symbol)) {
      this.showTokenDetails = true;
    }
  }

  async getTokenInfo(address: string) {
    this.showTokenDetails = false;
    this.tokenInfoLoading = true;
    this.validTokenLogoURI = true;

    /**
     * Default to resetting Token information upon change of address
     */
    this.token.name = undefined;
    this.token.logoURI = undefined;
    this.token.symbol = undefined;
    this.token.decimals = TokenService.DefaultDecimals;

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
      this.token.decimals = tokenInfo.decimals ?? TokenService.DefaultDecimals;
      this.token.logoURI = tokenInfo.logoURI;
    } catch (error) {
      this.consoleLogService.logMessage(error.message, "error");
    }

    this.tokenDetailsNotFound.name = !this.token.name;
    this.tokenDetailsNotFound.symbol = !this.token.symbol;
    this.tokenDetailsNotFound.decimals = !this.token.decimals;

    this.tokenInfoLoading = false;
    this.showTokenDetails = true;
  }

  async save(): Promise<void> {
    this.saving = true;
    const result = await this.form.validate({
      object: this.token,
      rules: this.getValidationRules(),
    }).finally(() => this.saving = false);

    if (!result.valid) {
      return;
    }
    this.viewMode = "view";
    this.onSaved?.();
  }

  logoLoaded(valid: boolean) {
    this.validTokenLogoURI = valid;
  }

  checkURL() {
    this.logoLoaded(Utils.isValidUrl(encodeURI(this.token.logoURI)));
  }

  private watchTokenProperties() {
    this.aureliaHelperService.createPropertyWatch(this.token, "vestedTransferAmount", newValue => {
      if (BigNumber.from((newValue || 0).toString()).isZero()) {
        this.token.vestedFor = undefined;
        this.token.cliffOf = undefined;
      }
    });
    this.aureliaHelperService.createPropertyWatch(this.token, "vestedFor", newValue => {
      this.form.revalidateErrors();
      if (newValue >= 0) {
        this.token.cliffOf = this.token.cliffOf ? Math.min(newValue, this.token.cliffOf) : this.token.cliffOf;
      } else {
        this.token.cliffOf = undefined;
      }
    });
    this.aureliaHelperService.createPropertyWatch(this.token, "address", address => {
      this.token.amount = undefined;
      this.getTokenInfo(address);
    });
    this.aureliaHelperService.createPropertyWatch(this.token, "decimals", decimals => {
      if (decimals === undefined) {
        this.token.decimals = TokenService.DefaultDecimals;
      }

      // Clear amount after every decimal change
      this.token.amount = undefined;
    });
    this.aureliaHelperService.createPropertyWatch(this.token, "logoURI", () => {
      this.checkURL();
    });
  }

  private addValidation() {
    const rules = this.getValidationRules();

    this.form.addObject(this.token, rules);
  }

  private getValidationRules() {
    return ValidationRules
      .ensure<IToken, string>(data => data.address)
      .required()
      .satisfiesRule(Validation.isETHAddress)
      .then()
      .satisfiesRule("isValidIERC20Address")
      .ensure<string>(data => data.amount)
      .required()
      .min(0)
      .ensure<string>(data => data.name)
      .required()
      .ensure<string>(data => data.symbol)
      .required()
      .ensure<number>(data => data.decimals)
      .min(0)
      .max(18)
      .required()
      .ensure<string>(data => data.logoURI)
      .required()
      .withMessage("Logo image is required")
      .satisfiesRule(Validation.imageUrl)
      .satisfiesRule(Validation.imageSize, 5000000)
      .satisfiesRule(Validation.imageExtension, ["JPG", "PNG", "GIF", "BMP"])
      .ensure<string>(data => data.instantTransferAmount)
      .satisfies((value, data) => {
        return data.amount && BigNumber.from((value || 0).toString()).lte(BigNumber.from(data.amount));
      })
      .when(data => Boolean(data.amount))
      .withMessage("Instant transfer amount can't ge bigger than Token Amount")
      .ensure<string>(data => data.vestedTransferAmount)
      .satisfies((value, data) => {
        return data.amount && BigNumber.from((value || 0).toString()).lte(BigNumber.from(data.amount));
      })
      .when(data => Boolean(data.amount))
      .withMessage("Vested transfer amount can't ge bigger than Token Amount")
      .ensure<number>(data => data.vestedFor)
      .required()
      .when(data => !BigNumber.from((data.vestedTransferAmount || 0).toString()).isZero())
      .withMessage("Please provide a vesting period")
      .min(0)
      .ensure<number>(data => data.cliffOf)
      .required()
      .when(data => !BigNumber.from((data.vestedTransferAmount || 0).toString()).isZero())
      .withMessage("Please provide a cliff period")
      .satisfies((value: number, data) => value <= data.vestedFor)
      .when(data => data.vestedFor >= 0)
      .withMessage("Cliff period needs to be smaller or equal to vesting period")
      .min(0)
      .rules;
  }

  withCommas(seconds: number) {
    return this.numberService.toString(seconds, {thousandSeparated: true, mantissa: -1});
  }
}
