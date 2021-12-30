// import { bindable } from "aurelia-typed-observable-plugin";
import { customElement } from "aurelia-framework";
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
  // @bindable.string type: ButtonType;
  // @bindable.booleanAttr disabled = false;
  // @bindable.booleanAttr fullWidth = false;

  refSelectInput: HTMLSelectElement;
  select: SlimSelect;
  isOpen = false;
  attached():void {
    this.select = new SlimSelect({
      select: this.refSelectInput,

      // data: [
      //   { text: "Option 1"},
      //   { text: "Option 2"},
      //   { text: "Option 3"},
      //   { text: "Option 4"},
      //   { text: "Option 5"},
      //   { text: "Option 6"},
      //   { text: "Option 7"},
      //   { text: "Option 8"},
      //   { text: "Option 9"},
      //   { text: "Option 10"},
      // ],
    });
  }
}
