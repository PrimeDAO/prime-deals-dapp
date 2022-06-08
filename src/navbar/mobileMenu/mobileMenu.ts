import { bindable, inject } from "aurelia";
import {IRouter} from "@aurelia/router";
@inject()
export class MobileMenu {
  @bindable menuOpen: boolean;
  @bindable gotoCallback: ({url: string}) => void;
  @bindable navigateCallback: ({href: string}) => void;

  constructor(@IRouter private router: IRouter) {

  }
}
