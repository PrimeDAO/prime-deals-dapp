import { bindable } from "aurelia-typed-observable-plugin";
import { bindingMode, computedFrom, customElement } from "aurelia-framework";
import "./prange-slider.scss";
import { Utils } from "../../../../services/utils";
import { toBigNumberJs } from "../../../../services/BigNumberService";
import { BigNumber } from "ethers";

@customElement("prange-slider")
export class PRangeSlider {
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = 0.5;
  @bindable.booleanAttr disabled = false;
  @bindable leftLabel?: string;
  @bindable rightLabel?: string;
  @bindable maxValue = 100;
  @bindable.number decimals: number;
  @bindable.booleanAttr hidePercentage = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) left: number | string | BigNumber;
  @bindable({defaultBindingMode: bindingMode.twoWay}) right: number | string | BigNumber;

  alreadyUpdated = false;
  leftInput: HTMLElement;
  rightInput: HTMLElement;

  constructor(public element: Element) {
  }

  bind() {
    this.updateValue();
    this.valueChanged(this.value);
  }

  attached() {
    this.updateCssVariables();
  }

  @computedFrom("value")
  get percentage() {
    return Math.round(this.value ?? 0);
  }

  @computedFrom("value")
  get leftPercentage() {
    return Math.round((1 - this.value) * 100);
  }

  @computedFrom("value")
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
    this.left = BigNumber.from(this.clamp(this.left)) ?? BigNumber.from(0);
    this.right = BigNumber.from(this.maxValue).sub(this.left);
    this.alreadyUpdated = true;
    this.updateValue();
  }

  updateLeft() {
    this.right = BigNumber.from(this.clamp(this.right)) ?? BigNumber.from(0);
    this.left = BigNumber.from(this.maxValue).sub(this.right);
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
