import { bindable } from "aurelia-typed-observable-plugin";
import { bindingMode, computedFrom, customElement } from "aurelia-framework";
import "./prange-slider.scss";
import { Utils } from "../../../../services/utils";
import { NumberService } from "../../../../services/NumberService";

@customElement("prange-slider")
export class PRangeSlider {
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = 50;
  @bindable.booleanAttr disabled = false;
  @bindable leftLabel?: string;
  @bindable rightLabel?: string;
  @bindable maxValue = 100;
  @bindable.booleanAttr notWei = true;
  @bindable.booleanAttr disabledInputs = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) left: number | string;
  @bindable({defaultBindingMode: bindingMode.twoWay}) right: number | string;
  alreadyUpdated = false;

  constructor(public element: Element, private numberService: NumberService) {
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
    this.updateCssVariables();
    return this.value ?? 0;
  }

  valueChanged(newValue: number, oldValue?: number) {
    if (this.alreadyUpdated || Number(newValue) === Number(oldValue)) {
      this.alreadyUpdated = false;
      return;
    }
    this.value = newValue ?? oldValue;

    this.left = this.numberService.toString(this.percentageToAbsoluteValue(this.value), {});
    this.right = this.numberService.toString(this.percentageToAbsoluteValue(100 - this.value), {});
  }

  maxValueChanged() {
    this.valueChanged(this.value);
  }

  updateCssVariables() {
    const maxErrorCorrection = 25;
    Utils.setCssVariable("--thumb-position", `${this.value}%`, this.element as HTMLElement);
    Utils.setCssVariable("--thumb-position-correction", `-${this.value / 100 * maxErrorCorrection}px`, this.element as HTMLElement);
  }

  private absoluteValueToPercentage(value: number) {
    return this.maxValue ? Math.min(Math.max(0, value), this.maxValue) / this.maxValue * 100 : undefined;
  }

  leftChanged(newValue: number) {
    if (this.alreadyUpdated) {
      this.alreadyUpdated = false;
      return;
    }
    this.alreadyUpdated = true;
    this.value = this.absoluteValueToPercentage(newValue);
    this.alreadyUpdated = true;
    const right = this.numberService.toString(this.percentageToAbsoluteValue(100 - this.value), {});
    if (right !== this.right) {
      this.alreadyUpdated = true;
      this.right = right;
    }
  }

  private updateValue() {
    this.value = this.left ? this.absoluteValueToPercentage(Number(this.left)) : this.value;
  }

  rightChanged(newValue: number) {
    if (this.alreadyUpdated) {
      this.alreadyUpdated = false;
      return;
    }
    this.alreadyUpdated = true;
    this.value = 100 - this.absoluteValueToPercentage(newValue);
    const left = this.numberService.toString(this.percentageToAbsoluteValue(this.value), {});
    if (left !== this.left) {
      this.alreadyUpdated = true;
      this.left = left;
    }
  }

  private percentageToAbsoluteValue(value: number) {
    return this.maxValue ? value / 100 * this.maxValue : undefined;
  }

}
