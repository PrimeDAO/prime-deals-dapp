import { bindable } from "aurelia-typed-observable-plugin";
import { bindingMode, computedFrom, customElement } from "aurelia-framework";
import "./prange-slider.scss";
import { Utils } from "../../../../services/utils";

@customElement("prange-slider")
export class PRangeSlider {
  @bindable({defaultBindingMode: bindingMode.twoWay}) value: number = 50;
  @bindable.booleanAttr disabled = false;
  @bindable leftLabel?: string;
  @bindable rightLabel?: string;
  @bindable maxValue = 100;
  @bindable.ref rangeInput: HTMLInputElement;

  constructor(public element: Element) {
  }

  @computedFrom("value")
  get percentage() {
    this.updateCssVariables()
    return this.value ?? 0;
  }

  @computedFrom("value", "maxValue")
  get leftValue() {
    return this.percentageToAbsoluteValue(this.value)
  }

  set leftValue(value: number) {
    this.value = this.absoluteValueToPercentage(value ?? 0)
  }

  @computedFrom("value", "maxValue")
  get rightValue() {
    return this.percentageToAbsoluteValue(100 - this.value)
  }

  set rightValue(value: number) {
    this.value = this.absoluteValueToPercentage(this.maxValue - (value ?? 0))
  }

  attached() {
    this.updateCssVariables()
  }

  updateCssVariables() {
    const maxErrorCorrection = 25;
    Utils.setCssVariable('--thumb-position', `${this.value}%`, this.element as HTMLElement)
    Utils.setCssVariable('--thumb-position-correction', `-${this.value / 100 * maxErrorCorrection}px`, this.element as HTMLElement)
  }

  private absoluteValueToPercentage(value: number) {
    return Math.min(Math.max(0, value), this.maxValue) / this.maxValue * 100;
  }

  private percentageToAbsoluteValue(value: number) {
    return Math.round(value / 100 * this.maxValue);
  }
}
