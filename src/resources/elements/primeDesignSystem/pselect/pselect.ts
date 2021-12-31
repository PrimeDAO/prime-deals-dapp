import { bindable, customElement } from "aurelia-framework";
import SlimSelect from "slim-select";
import "./pselect.scss";

/**
 * Usage:
 *    <pselect type="primary">Primary</pselect>
 *    <pselect type="secondary">Secondary</pselect>
 *    <pselect type="tertiary">Tertiary</pselect>
 *    <pselect type="primary" disabled>Primary - Disabled</pselect>
 *    <pselect type="secondary" disabled>Secondary - Disabled</pselect>
 *    <pselect type="tertiary" disabled>Tertiary - Disabled</pselect>
 *    <pselect type="primary" click.delegate="message('Hi!')">Clickable</pselect>
 *    <pselect ... full-width>Full-Width</pselect>
*/

@customElement("pselect")
export class PButton {
  // @bindable.booleanAttr disabled = false;
  // @bindable.booleanAttr fullWidth = false;
  @bindable data: Array<{value: string, text: string, innerHTML: string}>;
  @bindable placeholder = "Please Select...";
  @bindable isSearchable = false;

  refSelectInput: HTMLSelectElement;
  select: SlimSelect;
  isOpen = false;

  attached(): void {
    this.select = new SlimSelect({
      placeholder: "<span class=\"loading\"><i class=\"fas fa-circle-notch\" ></i> Loading...</span>",
      select: this.refSelectInput,
      searchText: "DAO Name is missing.",
      searchPlaceholder: "Search DAO Name",
      hideSelectedOption: true,
      showSearch: this.isSearchable,
      data: this.data,
    });
  }

  dataChanged(): void {
    if (this.select) {
      this.select.setData([{text: this.placeholder, placeholder: true}, ...this.data]);
    }
  }
}
