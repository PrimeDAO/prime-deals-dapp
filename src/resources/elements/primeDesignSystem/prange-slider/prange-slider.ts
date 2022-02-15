import { bindable } from "aurelia-typed-observable-plugin";
import { bindingMode, computedFrom, customElement } from "aurelia-framework";
import "./prange-slider.scss";
import { Utils } from "../../../../services/utils";

@customElement("prange-slider")
export class PRangeSlider {
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = 50;
  @bindable.booleanAttr disabled = false;
  @bindable leftLabel?: string;
  @bindable rightLabel?: string;
  @bindable maxValue = 100;
  @bindable({defaultBindingMode: bindingMode.twoWay}) left: number;
  @bindable({defaultBindingMode: bindingMode.twoWay}) right: number;
  @bindable.ref rangeInput: HTMLInputElement;

  constructor(public element: Element) {
  }

  @computedFrom("value", "maxValue")
  get leftValue() {
    return this.left = this.percentageToAbsoluteValue(this.value);
  }

  @computedFrom("value", "maxValue")
  get rightValue() {
    return this.right = this.percentageToAbsoluteValue(100 - this.value);
  }

  @computedFrom("value")
  get percentage() {
    this.updateCssVariables();
    return this.value ?? 0;
  }

  bind() {
    this.value = this.absoluteValueToPercentage(this.left ?? this.maxValue / 2);
  }

  set leftValue(value: number) {
    this.value = this.absoluteValueToPercentage(value ?? 0);
  }

  attached() {
    this.updateCssVariables();
  }

  set rightValue(value: number) {
    this.value = this.absoluteValueToPercentage(this.maxValue - (value ?? 0));
  }

  updateCssVariables() {
    const maxErrorCorrection = 25;
    Utils.setCssVariable("--thumb-position", `${this.value}%`, this.element as HTMLElement);
    Utils.setCssVariable("--thumb-position-correction", `-${this.value / 100 * maxErrorCorrection}px`, this.element as HTMLElement);
  }

  private absoluteValueToPercentage(value: number) {
    return this.maxValue ? Math.min(Math.max(0, value), this.maxValue) / this.maxValue * 100 : undefined;
  }

  private percentageToAbsoluteValue(value: number) {
    return this.maxValue ? Math.round(value / 100 * this.maxValue) : undefined;
  }
}
