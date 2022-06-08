import { autoSlot } from "resources/temporary-code";
import { processContent } from "@aurelia/runtime-html";
import { bindable } from "aurelia";

@processContent(autoSlot)
export class StatusActionBar {
  @bindable content: string;
  @bindable iconClass = "info-circle";
  @bindable iconColor = "warning";
}
