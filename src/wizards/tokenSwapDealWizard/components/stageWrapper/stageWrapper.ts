import { bindable } from "aurelia";
import { processContent } from "@aurelia/runtime-html";
import { autoSlot } from "../../../../resources/temporary-code";

@processContent(autoSlot)
export class stageWrapper {
  @bindable header: string;
  @bindable wizardManager: any;
  @bindable showSubmit = false;
  @bindable onSubmit: () => void;
}
