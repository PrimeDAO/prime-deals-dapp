import { autoSlot } from "resources/temporary-code";
import { processContent } from "@aurelia/runtime-html";
import { containerless, customElement, bindable, IDisposable, ICustomElementViewModel } from "aurelia";
import { AureliaHelperService } from "services/AureliaHelperService";

/**
 * wrap this element around some content and set `onOff` to true when you want to disable and dim the contained content.
 */
@containerless
@customElement("modalscreen")
@processContent(autoSlot)
export class ModalScreen implements ICustomElementViewModel {

  @bindable public onOff: boolean;
  @bindable public message: string;

  private container: HTMLElement;
  private mask: HTMLElement;
  private subscription: IDisposable;
  constructor(
    private aureliaHelperService: AureliaHelperService,
  ) {
    window.addEventListener("resize", this.onResize);
  }

  detaching() {
    window.removeEventListener("resive", this.onResize);
  }

  private onOffChanged(newValue, oldValue) {
    if (newValue && !oldValue) {
      this.showHide(true);
    } else if (!newValue && oldValue) {
      this.showHide(false);
    }
  }

  private onResize = () => {
    if (this.container) {
      const headerHeight = document.querySelector(".navbar-container")?.scrollHeight ?? 0;
      const footerHeight = document.querySelector(".footerContainer")?.scrollHeight ?? 0;
      this.mask.style.height = `${this.container.scrollHeight - headerHeight - footerHeight}px`;
      this.mask.style.top = `${this.container.offsetTop + headerHeight}px`;
      this.mask.style.bottom = `${footerHeight}px`;

    }
  };

  private showHide(onOff) {
    if (this.mask) {
      if (onOff) {
        this.onResize();
        this.mask.style.display = "flex";
        if (!this.subscription) {
          this.subscription = this.aureliaHelperService.createPropertyWatch(this.container, "scrollHeight", (newValue: boolean, oldValue: boolean) => {
            /**
             * catch when we've navigated
             */
            if (this.onOff && (newValue !== oldValue)) {
              this.onResize();
            }
          });
        }
      } else {
        this.mask.style.display = "none";
        if (this.subscription) {
          this.subscription.dispose();
          this.subscription = null;
        }
      }
    }
  }
  public attached(): void {
    this.showHide(this.onOff);
  }
}
