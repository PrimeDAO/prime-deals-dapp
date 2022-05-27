import { processContent } from '@aurelia/runtime-html';
import { bindable, customElement } from "aurelia";
import { autoSlot } from 'resources/temporary-code';

@customElement("pchip")
@processContent(autoSlot)
export class PChip {
  @bindable color = "";
}
