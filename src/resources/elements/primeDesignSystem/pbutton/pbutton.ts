import { bindable, customElement } from "aurelia";
import { processContent } from '@aurelia/runtime-html';
import { toBoolean } from "../../../binding-behaviours";
import { autoSlot } from "../../../temporary-code";

/**
 * Usage:
 *    <pbutton type="primary">Primary</pbutton>
 *    <pbutton type="secondary">Secondary</pbutton>
 *    <pbutton type="tertiary">Tertiary</pbutton>
 *    <pbutton type="primary" disabled>Primary - Disabled</pbutton>
 *    <pbutton type="secondary" disabled>Secondary - Disabled</pbutton>
 *    <pbutton type="tertiary" disabled>Tertiary - Disabled</pbutton>
 *    <pbutton type="primary" click.delegate="message('Hi!')">Clickable</pbutton>
 *    <pbutton type="primary" no-animation>Not Animated</pbutton>
 *    <pbutton ... full-width>Full-Width</pbutton>
 */
export type ButtonType = "primary" | "secondary" | "tertiary" | "formfield";

@customElement("pbutton")
@processContent(autoSlot)
export class PButton {
  @bindable({set: value => String(value)}) type: ButtonType;
  @bindable({set: toBoolean}) disabled = false;
  @bindable({set: toBoolean}) noAnimation = false;
  @bindable({set: toBoolean}) isLoading = false;
  @bindable({set: toBoolean}) fullWidth = false;
}
