import { bindable } from "aurelia-framework";
import "./address-link.scss";
export class AddressLink {
  @bindable address:string;
  constructor() {
    // you can inject the element or any DI in the constructor
  }
}
