import "./pselect.scss";
import { ValidationState } from "../types";
import { bindable, BindingMode, customElement, IPlatform } from "aurelia";
import SlimSelect from "slim-select";

export interface IPSelectItemConfig {
  value: string,
  text: string,
  innerHTML?: string,
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
export class PSelect {
  @bindable disabled = false;
  @bindable data?: Array<IPSelectItemConfig> = [];
  @bindable placeholder = "Please Select...";
  @bindable searchText = "No result found.";
  @bindable searchPlaceholder ="Type to search...";
  @bindable isSearchable = false;
  @bindable multiple = false;
  @bindable({mode: BindingMode.twoWay}) value?: string | string[];
  @bindable validationState?: ValidationState;
  constructor(@IPlatform private readonly platform: IPlatform){}

  refSelectInput: HTMLSelectElement;
  select: SlimSelect;
  isOpen = false;

  attached(): void {
    this.platform.taskQueue.queueTask(() => this.select?.set(this.value));
  }
  bind(): void {
    this.select = new SlimSelect({
      placeholder: "<span class=\"loading\"><i class=\"fas fa-circle-notch\"></i> Loading...</span>",
      select: this.refSelectInput,
      isEnabled: !this.disabled,
      searchText: this.searchText,
      searchPlaceholder: this.searchPlaceholder,
      hideSelectedOption: true,
      showSearch: this.isSearchable,
      data: [
        {text: this.placeholder, placeholder: true, value: null},
        ...this.data ?? [],
      ],
      onChange: info => {
        this.value = Array.isArray(info) ? info.map(item => item.value) : (info.value ?? this.value);
      },
    });
  }
  detached(): void {
    this.select?.destroy();
  }

  dataChanged(): void {
    if (this.select) {
      this.select.setData([{text: this.placeholder, placeholder: true, value: null}, ...this.data ?? []]);
      this.platform.taskQueue.queueTask(() => this.select?.set(this.value));
    }
  }

  valueChanged(): void {
    this.select?.set(this.value);
  }

  disabledChanged(disabled: boolean) {
    if (disabled) {
      this.select.disable();
    } else {
      this.select.enable();
    }
  }
}
