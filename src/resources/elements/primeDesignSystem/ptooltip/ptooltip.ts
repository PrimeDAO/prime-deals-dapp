import { customAttribute } from "aurelia-framework";
import "./ptooltip.scss";
import tippy, { Instance, Placement, Props } from "tippy.js";
import { bindable } from "aurelia-typed-observable-plugin";

/** Value found by getting width of 42 'M's of font size 14px. */
const MAX_WIDTH = 560;

@customAttribute("ptooltip")
export class PTooltip {
  @bindable({primaryProperty: true}) content: string;
  @bindable placement: Placement;
  @bindable.boolean interactive = false;
  @bindable.boolean visible = true;
  @bindable.boolean allowHtml = false;
  @bindable appendTo: Props["appendTo"] | string;
  @bindable.number maxWidth: number = MAX_WIDTH;

  private tooltip: Instance;

  constructor(private element: Element) {
    this.tooltip = tippy(this.element, {
      theme: "prime-design-system",
      maxWidth: this.maxWidth,
    });
  }

  propertyChanged(name: string, newValue: any) {
    // Aurelia doesn't trigger change for properties like `allowHTML`. It wants properties to be like this:`allowHtml`.
    // But Tippy.js wants that property to be `allowHTML`, so we need to convert it
    const convertPropertyToTippyConfig: Partial<Record<keyof PTooltip, keyof Props>> = {
      allowHtml: "allowHTML",
    };
    name = convertPropertyToTippyConfig[name] ?? name;

    // Allow appendTo be a string as well on top of what Tippy.js requires it to be
    if (name === "appendTo" && newValue !== "parent" && typeof newValue === "string") {
      newValue = document.querySelector(newValue);
    }

    // this works only if this component's properties have the same name as the tippy.js config properties
    // additional properties (like 'visible' for ex.) need to be handled separately (see the 'visibleChanged' method)
    this.tooltip.setProps({[name]: newValue});
  }

  visibleChanged(visible: string) {
    if (visible) {
      this.tooltip.enable();
    } else {
      this.tooltip.disable();
    }
  }
}
