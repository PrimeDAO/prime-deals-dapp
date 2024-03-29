import { bindable, customElement } from "aurelia";

@customElement("pprogress-bar")
export class PProgressBar {
  @bindable max: number;
  @bindable current: number;
  @bindable percent: number;
  @bindable color: string;
  constructor() {
    // you can inject the element or any DI in the constructor
  }

  get progressBarStyle() {
    return `width:${this.percent || ((this.current / this.max) * 100)}%;background-color:${this.color}`;
  }

}
