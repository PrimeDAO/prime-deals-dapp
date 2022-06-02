import tippy, { Instance, Placement, Props } from "tippy.js";
import { customAttribute, bindable, ICustomAttributeViewModel } from "aurelia";
import { toBoolean } from "resources/binding-behaviours";

@customAttribute("ptooltip")
export class PTooltip implements ICustomAttributeViewModel {
  @bindable({ primary: true }) content: string;
  @bindable placement: Placement;
  @bindable({ set: toBoolean, type: Boolean }) interactive = false;
  @bindable({ set: toBoolean, type: Boolean }) visible = true;
  @bindable({ set: toBoolean, type: Boolean, attribute: "allowHTML" }) allowHtml = false;
  @bindable appendTo: Props["appendTo"] | string;

  private tooltip: Instance;

  constructor(private element: Element) {
    /** Value found by getting width of 42 'M's of font size 14px. */
    const maxWidth = 560;
    this.tooltip = tippy(this.element, {
      theme: "prime-design-system",
      maxWidth,
      zIndex: 10002, //this is needed so tooltips will be above ppopup-notifications
    });
  }

  bound() {
    if (!this.content) {
      this.tooltip.disable();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {appendTo, ...props} = this;
    this.tooltip.setProps(props);
  }

  propertyChanged(name: string, newValue: any) {

    // Allow appendTo be a string as well on top of what Tippy.js requires it to be
    if (name === "appendTo" && newValue !== "parent" && typeof newValue === "string") {
      newValue = document.querySelector(newValue);
    }
    // this works only if this component's properties have the same name as the tippy.js config properties
    // additional properties (like 'visible' for ex.) need to be handled separately (see the 'visibleChanged' method)
    this.tooltip.setProps({ [name]: newValue });
  }

  visibleChanged(visible: string) {
    if (visible) {
      this.tooltip.enable();
    } else {
      this.tooltip.disable();
    }
  }

  contentChanged(content: string) {
    if (content) {
      this.tooltip.enable();
    } else {
      this.tooltip.disable();
    }
  }
}
