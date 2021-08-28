import "./d2d-button.scss";
import { autoinject, bindable, bindingMode} from "aurelia-framework";
import { Router } from "aurelia-router";

@autoinject
export class StyledButton {
  constructor(
    private router: Router,
  ) { }

  @bindable({ defaultBindingMode: bindingMode.twoWay })
  public disabled = false;
}
