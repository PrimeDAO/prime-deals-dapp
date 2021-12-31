import { bindable } from "aurelia-typed-observable-plugin";
import { customElement } from "aurelia-framework";
import "./pcard.scss";

/**
 * Usage:
 *    <pcard>Default</pcard>
 *    <pcard type="success">Success</pcard>
 *    <pcard type="alert">Alert</pcard>
 *    <pcard type="warning">Warning</pcard>
 *    <pcard ... click.delegate="message('Hi!')">Clickable</pcard>
 *    <pcard ... width="100%">Fix Size</pcard>
*/
export type CardType = "default" | "success" | "alert" | "warning" | "";

@customElement("pcard")
export class PCard {
  @bindable.string type: CardType = "";
  @bindable.string width = "100%";
}
