import "./d2d-button.scss";
import { autoinject, bindable} from "aurelia-framework";
import { Router } from "aurelia-router";

@autoinject
export class D2dButton {
  @bindable button: string;
  @bindable disabled = false;

  constructor(
    private router: Router,
  ) { }
}
