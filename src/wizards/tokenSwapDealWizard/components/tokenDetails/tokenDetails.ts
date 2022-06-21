import { IToken } from "../../../../entities/DealRegistrationTokenSwap";
import { AureliaHelperService } from "../../../../services/AureliaHelperService";
import { TokenService } from "../../../../services/TokenService";
import { Utils } from "../../../../services/utils";
import { NumberService } from "../../../../services/NumberService";
import { WizardType } from "../../dealWizardTypes";
import { BigNumber } from "ethers";
import { ConsoleLogService } from "services/ConsoleLogService";
import { bindable, BindingMode, inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { IValidationRules } from "@aurelia/validation";
import { newInstanceForScope } from "@aurelia/kernel";
import { PrimeErrorPresenter } from "../../../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";
import { ImageExtension, ImageSize, ImageUrl, IsEthAddress } from "../../../../resources/validation-rules";
import { ValidationService } from "../../../../services/ValidationService";
import { ViewMode } from "../../../../resources";

@inject()
export class TokenDetails {
  @bindable token: IToken;
  @bindable wizardType: WizardType;
  @bindable({mode: BindingMode.fromView}) onDelete: () => void;
  @bindable({mode: BindingMode.twoWay}) viewMode: ViewMode = "edit";
  @bindable hideDeleteButton: boolean;
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
    @IValidationRules private validationRules: IValidationRules,
    @newInstanceForScope(IValidationController) public form: IValidationController,
    private presenter: PrimeErrorPresenter,
    private validationService: ValidationService,
  ) {
    this.form.addSubscriber(presenter);
  }

  async attaching() {
    this.addValidation();
    this.watchTokenProperties();

    this.viewMode = this.viewMode ?? "edit";

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

    this.token.vestedFor = this.token.vestedFor ?? 0;
    this.token.cliffOf = this.token.cliffOf ?? 0;

    const result = await this.form.validate().finally(() => this.saving = false);

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

  withCommas(seconds: number) {
    return this.numberService.toString(seconds, {thousandSeparated: true, mantissa: -1});
  }

  private watchTokenProperties() {
    this.aureliaHelperService.createPropertyWatch(this.token, "vestedTransferAmount", newValue => {
      if (BigNumber.from((newValue || 0).toString()).isZero()) {
        this.token.vestedFor = 0;
        this.token.cliffOf = 0;
      }
    });
    this.aureliaHelperService.createPropertyWatch(this.token, "vestedFor", newValue => {
      this.form.revalidateErrors();
      if (newValue >= 0) {
        this.token.cliffOf = this.token.cliffOf ? Math.min(newValue, this.token.cliffOf) : this.token.cliffOf;
      } else {
        this.token.cliffOf = 0;
      }
    });
    this.aureliaHelperService.createPropertyWatch(this.token, "address", address => {
      this.form.reset();
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
    this.validationRules
      .on(this.token)
      .ensure("address")
      .required()
      .satisfiesRule(new IsEthAddress())
      .satisfiesRule(this.validationService.isValidIERC20Address())
      .ensure("amount")
      .required()
      .min(0)
      .ensure("name")
      .required()
      .ensure("symbol")
      .required()
      .ensure("decimals")
      .min(0)
      .max(18)
      .required()
      .ensure("logoURI")
      .required()
      .withMessage("Logo image is required")
      .satisfiesRule(new ImageUrl())
      .satisfiesRule(new ImageSize(5000000))
      .satisfiesRule(new ImageExtension(["JPG", "PNG", "GIF", "BMP"]))
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
      .min(0);
  }
}
