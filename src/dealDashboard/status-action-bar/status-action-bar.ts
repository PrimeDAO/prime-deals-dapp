import { bindable } from "aurelia";
import "./status-action-bar.scss";

export class StatusActionBar {
  @bindable content: string;
  @bindable iconClass = "info-circle";
  @bindable iconColor = "warning";
}
