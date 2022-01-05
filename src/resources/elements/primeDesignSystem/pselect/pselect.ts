import { bindable, customElement } from "aurelia-framework";
import SlimSelect from "slim-select";
import "./pselect.scss";

export interface IPSelectItemConfig {
  value: string,
  text: string,
  innerHTML: string
}

/**
 * `pselect` is a custom element to select a value from a list of items with an
 * optional search box and customized options.
 * `pselect` is styled according to the Prime Design System.
 *
 * Usage example:
 * In the View:
 *  <pselect
 *    is-searchable="false" // optional
 *    placeholder="Please Select..." // optional
 *    search-text="No results found" // optional
 *    search-placeholder="Type To Search..." // optional
 *    disabled="false" // optional
 *    data.bind="daos">
 *  </pselect>
 *
 * In the ViewModel:
 *  this.daos = this.daoList.map((dao: any) => ({
 *    innerHTML: `<span><img src="${dao.logo}" /> ${dao.name}</span>`,
 *    text: dao.name,
 *    value: dao.daoId,
 *  }));
*/
@customElement("pselect")
export class PButton {
  @bindable disabled = false;
  @bindable data: Array<IPSelectItemConfig>;
  @bindable placeholder = "Please Select...";
  @bindable searchText = "No result found.";
  @bindable searchPlaceholder =" Type to search...";
  @bindable isSearchable = false;

  refSelectInput: HTMLSelectElement;
  select: SlimSelect;
  isOpen = false;

  attached(): void {
    this.select = new SlimSelect({
      placeholder: "<span class=\"loading\"><i class=\"fas fa-circle-notch\"></i> Loading...</span>",
      select: this.refSelectInput,
      isEnabled: !this.disabled,
      searchText: this.searchText,
      searchPlaceholder: "Type to search...",
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
