import { processContent } from '@aurelia/runtime-html';
import { bindable, customElement } from "aurelia";
import { autoSlot } from 'resources/temporary-code';

/**
 * Usage:
 *    <pcard>Default</pcard>
 *    <pcard type="gradient">Gradient left border</pcard>
 *    <pcard ... click.delegate="message('Hi!')">Clickable</pcard>
 *    <pcard ... width="100%">Fix Size</pcard>
 *
 *    <div class="pcard">As a div</div>
 *    <div class="pcard gradient">As a div with gradient border</div>
 *
 * Options:
 *  type: "gradient" (optional)
 *
 *  Override background color on a gradient pcard:
 *  use:
 *  ```scss
 *  &.gradient {
 *    @include pcardBgAndGradient($backgroundColor, $grColor01, $grColor02);
 *  }
 * ```
 * Defaults:
 * $backgroundColor: $BG02
 * $grColor01: $Primary01
 * $grColor02: $Secondary02
*/
export type CardType = "gradient" | "";

@customElement("pcard")
@processContent(autoSlot)
export class PCard {
  @bindable type: CardType = "";
}
