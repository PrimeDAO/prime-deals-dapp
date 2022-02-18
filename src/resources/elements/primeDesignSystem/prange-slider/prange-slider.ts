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

  updateRight() {
    this.right = this.numberService.toString(this.clamp(this.maxValue - Number(this.left)), {});
    this.alreadyUpdated = true;
    this.updateValue();
  }

  private updateValue() {
    this.value = this.left ? this.absoluteValueToPercentage(Number(this.left)) : this.value;
  }

  private percentageToAbsoluteValue(value: number) {
    return this.maxValue ? value / 100 * this.maxValue : undefined;
  }

  updateLeft() {
    this.left = this.numberService.toString(this.maxValue - this.clamp(this.right), {});
    this.alreadyUpdated = true;
    this.updateValue();
  }

  private absoluteValueToPercentage(value: number) {
    return this.maxValue ? Math.round(Math.min(Math.max(0, value), this.maxValue) / this.maxValue * 100) : this.value;
  }

  private clamp(value: number | string) {
    return value ? Math.min(Math.max(0, Number(value)), this.maxValue) : 0;
  }
}
