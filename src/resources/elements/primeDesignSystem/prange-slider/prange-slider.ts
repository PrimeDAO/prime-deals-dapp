import { Utils } from "../../../../services/utils";
import { toBigNumberJs } from "../../../../services/BigNumberService";
import { BigNumber } from "ethers";
import { bindable, BindingMode, customElement } from "aurelia";

@customElement("prange-slider")
export class PRangeSlider {
  @bindable({mode: BindingMode.twoWay}) value = 0.5;
  @bindable disabled = false;
  @bindable leftLabel?: string;
  @bindable rightLabel?: string;
  @bindable maxValue = 100;
  @bindable decimals: number;
  @bindable hidePercentage = false;
  @bindable({mode: BindingMode.twoWay}) left: number | string | BigNumber;
  @bindable({mode: BindingMode.twoWay}) right: number | string | BigNumber;

  alreadyUpdated = false;
  leftInput: HTMLElement;
  rightInput: HTMLElement;

  constructor(public element: Element) {
  }

  bind() {
    this.updateValue();
    if (this.left || this.right) {
      this.updateLeft();
    }
  }

  attached() {
    this.updateCssVariables();
  }

  get percentage() {
    return Math.round(this.value ?? 0);
  }

  get leftPercentage() {
    return Math.round((1 - this.value) * 100);
  }

  get rightPercentage() {
    return Math.round(this.value * 100);
  }

  valueChanged(newValue: number, oldValue?: number) {
    this.updateCssVariables();
    if (this.alreadyUpdated || Number(newValue).toFixed(2) === Number(oldValue).toFixed(2)) {
      this.alreadyUpdated = false;
      return;
    }
    this.left = this.percentageToAbsoluteValue(Number((1 - this.value).toFixed(2)));
    this.right = this.percentageToAbsoluteValue(this.value);
  }

  maxValueChanged() {
    this.valueChanged(this.value);
  }

  updateCssVariables() {
    const maxErrorCorrection = 25;
    Utils.setCssVariable("--thumb-position", `${this.value * 100}%`, this.element as HTMLElement);
    Utils.setCssVariable("--thumb-position-correction", `-${(this.value * 100) / maxErrorCorrection}px`, this.element as HTMLElement);
  }

  updateRight() {
    this.left = (BigNumber.from(this.clamp(this.left)) ?? BigNumber.from(0)).toString();
    this.right = this.maxValue ? BigNumber.from(this.maxValue).sub(this.left).toString() : "";
    this.alreadyUpdated = true;
    this.updateValue();
  }

  updateLeft() {
    this.right = (BigNumber.from(this.clamp(this.right)) ?? BigNumber.from(0)).toString();
    this.left = this.maxValue ? BigNumber.from(this.maxValue).sub(this.right).toString() : "";
    this.alreadyUpdated = true;
    this.updateValue();
  }

  private percentageToAbsoluteValue(value: number) {
    if (!this.maxValue || Number.isNaN(value)) {
      return undefined;
    }

    return toBigNumberJs(this.maxValue).times(value).toString();
  }

  private updateValue() {
    this.value = this.left ? 1 - this.absoluteValueToPercentage(this.left) : this.value;
  }

  private absoluteValueToPercentage(value: number | string | BigNumber) {
    if (!this.maxValue) {
      return this.value;
    }
    const bigNumber = BigNumber.from(value);
    if (bigNumber.lt(0)) {
      return 0;
    }
    if (bigNumber.gt(this.maxValue)) {
      return 1;
    }
    return toBigNumberJs(value).div(this.maxValue).toNumber();
  }

  private clamp(value: number | string | BigNumber) {
    if (!value) {
      return 0;
    }
    const bigNumber = BigNumber.from(value);
    if (bigNumber.lt(0)) {
      return 0;
    }
    if (bigNumber.gt(this.maxValue)) {
      return this.maxValue;
    }
    return value;
  }
}
