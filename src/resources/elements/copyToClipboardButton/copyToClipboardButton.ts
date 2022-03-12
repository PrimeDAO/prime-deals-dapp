import { EventType } from "./../../../services/constants";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject, bindable, containerless } from "aurelia-framework";
import "./copyToClipboardButton.scss";

@containerless
@autoinject
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
    private eventAggregator: EventAggregator,
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

    this.eventAggregator.publish(EventType.ShowMessage, this.message);

    e.stopPropagation();

    if (this.handleClick) {
      this.handleClick();
    }
  }
}
