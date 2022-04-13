import { autoinject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Utils } from "services/utils";
import { bindable } from "aurelia-typed-observable-plugin";
import "./navbar.scss";

@autoinject
export class Navbar {

  @bindable private showWalletMenu?: () => void;

  environment = process.env.NODE_ENV;

  menuOpen = false;

  constructor(private router: Router) {}

  private toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  private goto(url: string, newTab = true): void {
    this.menuOpen = false;
    Utils.goto(url, newTab);
  }

  private async resetDeals(){
    if (process.env.NODE_ENV !== "production"){
      await (await import("../server-browser-scripts/seed-data")).resetDeals();
    }
  }

  private navigate(href: string): void {
    this.menuOpen = false;
    this.router.navigate(href);
  }

  private handleShowWalletMenu(): void {
    this.showWalletMenu();
  }
}
