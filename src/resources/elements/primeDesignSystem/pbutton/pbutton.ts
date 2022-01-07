import { bindable } from "aurelia-typed-observable-plugin";
import { customElement } from "aurelia-framework";
import "./pbutton.scss";

/**
 * Usage:
 *    <pbutton type="primary">Primary</pbutton>
 *    <pbutton type="secondary">Secondary</pbutton>
 *    <pbutton type="tertiary">Tertiary</pbutton>
 *    <pbutton type="primary" disabled>Primary - Disabled</pbutton>
 *    <pbutton type="secondary" disabled>Secondary - Disabled</pbutton>
 *    <pbutton type="tertiary" disabled>Tertiary - Disabled</pbutton>
 *    <pbutton type="primary" click.delegate="message('Hi!')">Clickable</pbutton>
 *    <pbutton ... full-width>Full-Width</pbutton>
*/
export type ButtonType = "primary" | "secondary" | "tertiary";

@customElement("pbutton")
export class PButton {
  @bindable.string type: ButtonType;
  @bindable.booleanAttr disabled = false;
  @bindable.booleanAttr fullWidth = false;
}
