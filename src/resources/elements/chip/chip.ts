import "./chip.scss";
import { containerless, bindable } from "aurelia-framework";

@containerless
export class Chip {
  @bindable color = "";
}
