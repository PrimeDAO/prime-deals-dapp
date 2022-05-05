import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Utils } from "services/utils";
import { bindable } from "aurelia-typed-observable-plugin";
import "./navbar.scss";

@autoinject
export class Navbar {

  @bindable private showWalletMenu?: () => void;

  menuOpen = false;

  constructor(private router: Router) {}

  private toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  private goto(url: string, newTab = true): void {
    this.menuOpen = false;
    Utils.goto(url, newTab);
  }

  private navigate(href: string): void {
    this.menuOpen = false;
    this.router.navigate(href);
  }

  private handleShowWalletMenu(): void {
    this.showWalletMenu();
  }
}
