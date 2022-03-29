import { bindable } from "aurelia-typed-observable-plugin";
import { bindingMode, computedFrom, customElement } from "aurelia-framework";
import "./prange-slider.scss";
import { Utils } from "../../../../services/utils";
import { NumberService } from "../../../../services/NumberService";
import tippy, { Instance } from "tippy.js";

@customElement("prange-slider")
export class PRangeSlider {
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = 50;
  @bindable.booleanAttr disabled = false;
  @bindable leftLabel?: string;
  @bindable rightLabel?: string;
  @bindable maxValue = 100;
  @bindable.booleanAttr notWei = false;
  @bindable.number decimals: number;
  @bindable.booleanAttr hidePercentage = false;
  @bindable({defaultBindingMode: bindingMode.twoWay}) left: number | string;
  @bindable({defaultBindingMode: bindingMode.twoWay}) right: number | string;

  alreadyUpdated = false;
  leftInput: HTMLElement;
  leftInputToolTip?: Instance;
  rightInput: HTMLElement;
  rightInputToolTip?: Instance;

  constructor(public element: Element, private numberService: NumberService) {
  }

  bind() {
    this.updateValue();
    this.valueChanged(this.value);
  }

  attached() {
    this.updateCssVariables();

    this.leftInputToolTip = tippy(this.leftInput);
    this.rightInputToolTip = tippy(this.rightInput);
    this.leftInputToolTip.disable();
    this.rightInputToolTip.disable();
  }

  @computedFrom("value")
  get percentage() {
    return this.value ?? 0;
  }

  @computedFrom("value")
  get leftPercentage() {
    return 100 - this.value;
  }

  @computedFrom("value")
  get rightPercentage() {
    return this.value;
  }

  valueChanged(newValue: number, oldValue?: number) {
    this.updateCssVariables();
    if (this.alreadyUpdated || Number(newValue) === Number(oldValue)) {
      this.alreadyUpdated = false;
      return;
    }
    this.left = this.numberService.toString(this.percentageToAbsoluteValue(100 - this.value), {mantissa: 0});
    this.right = this.numberService.toString(this.percentageToAbsoluteValue(this.value), {mantissa: 0});

    this.updateTooltips();
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
    this.right = this.numberService.toString(this.maxValue - this.clamp(this.right), {});
    this.updateTooltips();
    this.alreadyUpdated = true;
    this.updateValue();
  }

  updateLeft() {
    this.left = this.numberService.toString(this.clamp(this.maxValue - Number(this.left)), {});
    this.updateTooltips();
    this.alreadyUpdated = true;
    this.updateValue();
  }

  private percentageToAbsoluteValue(value: number) {
    return this.maxValue ? value / 100 * this.maxValue : undefined;
  }

  private updateValue() {
    this.value = this.left ? 100 - this.absoluteValueToPercentage(Number(this.left)) : this.value;
  }

  private absoluteValueToPercentage(value: number) {
    return this.maxValue ? Math.round(Math.min(Math.max(0, value), this.maxValue) / this.maxValue * 100) : this.value;
  }

  private clamp(value: number | string) {
    return value ? Math.min(Math.max(0, Number(value)), this.maxValue) : 0;
  }

  updateTooltips() {
    if (this.left) {
      this.leftInputToolTip?.enable();
      this.leftInputToolTip?.setContent(String(this.left));
    } else {
      this.leftInputToolTip?.disable();
    }

    if (this.right) {
      this.rightInputToolTip?.enable();
      this.rightInputToolTip?.setContent(String(this.right));
    } else {
      this.rightInputToolTip?.disable();
    }
  }
}
