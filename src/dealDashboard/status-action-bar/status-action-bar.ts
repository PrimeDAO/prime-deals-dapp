import "./status-action-bar.scss";
import { bindable } from "aurelia-framework";

export class StatusActionBar {
  @bindable content: string;
  @bindable iconClass = "info-circle";
  @bindable iconColor = "warning";
}
