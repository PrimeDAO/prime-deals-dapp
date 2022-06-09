import { processContent } from "@aurelia/runtime-html";
import { bindable } from "aurelia";
import { autoSlot } from "./../../temporary-code";

@processContent(autoSlot)
export class HorizontalScroller {

  scroller: HTMLElement;
  scrollleft: number;
  scrollWidth: number;
  clientWidth: number;

  get scrollPos(): number { return this.scrollleft ?? 0; }

  @bindable itemCount: number;

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
    const visibleWidth = this.clientWidth;
    // itemWidth better not be 0
    const itemWidth = this.scrollWidth / this.itemCount;
    const visibleItemsCount = Math.floor(visibleWidth / itemWidth);
    /**
     * scroll by the sum of the widths of the wholly-visible items
     */
    return itemWidth * visibleItemsCount;
  }

  get atEnd(): boolean {
    /**
     * if the distance between the scrollPos and the end of the scroller is <= the
     * the width of the scroller, then presume we have scrolled as far as we can, or close enough.
     */
    return (this.scrollWidth - Math.ceil(this.scrollPos)) <= this.clientWidth;
  }

  get atBeginning(): boolean {
    return this.scrollPos === 0;
  }
}
