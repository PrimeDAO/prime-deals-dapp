import { containerless, bindable, IEventAggregator } from "aurelia";

@containerless
export class CopyToClipboardButton {

  /** supply either element or textToCopy */
  @bindable
  public element: HTMLElement;

  /** supply either element or textToCopy */
  @bindable
  public textToCopy: string;

  @bindable
  public message = "Copied to the clipboard";

  @bindable handleClick: () => void;

  constructor(
    @IEventAggregator private eventAggregator: IEventAggregator,
  ) { }

  private listener(e) { e.clipboardData.setData("text/plain", this.textToCopy); e.preventDefault(); }

  private copy(e: Event): void {
    if (this.element) {
      this.textToCopy = this.element.textContent;
    }

    const handler = this.listener.bind(this);

    document.addEventListener("copy", handler);
    document.execCommand("copy");
    document.removeEventListener("copy", handler);

    this.eventAggregator.publish("handleInfo", this.message);

    e.stopPropagation();

    if (this.handleClick) {
      this.handleClick();
    }
  }
}
