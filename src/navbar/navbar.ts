import { Router } from "aurelia-router";
import { containerless } from "aurelia-framework";
import { bindable } from "aurelia-typed-observable-plugin";
import "./navbar.scss";

@containerless
export class Navbar {
  @bindable.booleanAttr vertical: boolean;
  @bindable onNavigate?: () => void;

  constructor(private router: Router) {}

  navigate(href: string): void {
    if (this.onNavigate) {
      this.onNavigate();
    }
    this.router.navigate(href);
  }
}
