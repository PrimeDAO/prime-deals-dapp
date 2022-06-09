import { processContent } from "@aurelia/runtime-html";
import { bindable } from "aurelia";
import { autoSlot } from "./../../temporary-code";

@processContent(autoSlot)
export class HorizontalScroller {

  private scroller: HTMLElement;
  private scrollleft: number;

  private get scrollPos(): number { return this.scrollleft ?? 0; }

  @bindable private itemCount: number;

  left(): void {
    const scrollDistance = this.scrollDistance();

    this.scroller.scroll({
      left: this.scrollPos + scrollDistance,
      behavior: "smooth",
    });
  }

  right(): void {
    const scrollDistance = this.scrollDistance();

    this.scroller.scroll({
      left: this.scrollPos - scrollDistance,
      behavior: "smooth",
    });
  }

  scrollDistance(): number {
    const visibleWidth = this.scroller.clientWidth;
    // itemWidth better not be 0
    const itemWidth = this.scroller.scrollWidth / this.itemCount;
    const visibleItemsCount = Math.floor(visibleWidth / itemWidth);
    /**
     * scroll by the sum of the widths of the wholly-visible items
     */
    return itemWidth * visibleItemsCount;
  }

  private get atEnd(): boolean {
    if (!this.scroller) return false;
    /**
     * if the distance between the scrollPos and the end of the scroller is <= the
     * the width of the scroller, then presume we have scrolled as far as we can, or close enough.
     */
    return (this.scroller.scrollWidth - Math.ceil(this.scrollPos)) <= this.scroller.clientWidth;
  }

  private get atBeginning(): boolean {
    return this.scrollPos === 0;
  }
}
