import { autoinject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import "./dealTypeSelector.scss";

export interface IDealTypeBox {
  name: string,
  slug: string,
  isDisabled: boolean,
  description: string,
}

@autoinject
export class dealTypeSelector {
  @bindable title: string;
  @bindable description: string;
  @bindable boxes: IDealTypeBox[];

  constructor(private router: Router) { }

  navigate(slug: string): void {
    this.router.navigate(slug);
  }
}
