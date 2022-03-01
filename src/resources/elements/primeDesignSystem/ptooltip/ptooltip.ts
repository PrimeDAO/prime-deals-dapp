import { customAttribute } from "aurelia-framework";
import "./ptooltip.scss";
import tippy, { Instance, Placement } from "tippy.js";
import { bindable } from "aurelia-typed-observable-plugin";

@customAttribute('ptooltip')
export class PTooltip {
  @bindable interactive: boolean;
  @bindable placement: Placement;
  @bindable.boolean visible: boolean = true;
  @bindable({primaryProperty: true}) content: string;

  private tooltip: Instance;

  constructor(private element: Element) {
    this.tooltip = tippy(this.element, {theme: 'prime-design-system'})
  }

  propertyChanged(name: string, newValue: string) {
    // this works only if this component's properties have the same name as the tippy.js config properties
    // additional properties (like 'visible' for ex.) need to be handled separately (see the 'visibleChanged' method)
    this.tooltip.setProps({[name]: newValue})
  }

  visibleChanged(visible: string) {
    if (visible) {
      this.tooltip.enable()
    } else {
      this.tooltip.disable()
    }
  }
}
