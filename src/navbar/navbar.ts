import { bindable, inject } from "aurelia";

@inject()
export class Navbar {
  @bindable private showWalletMenu?: () => void;

  // TODO uncomment everything here
  // environment = process.env.FIREBASE_ENVIRONMENT;
  //
  // menuOpen = false;
  //
  // constructor(@IRouter private router: IRouter) {
  // }
  //
  // private toggleMenu() {
  //   this.menuOpen = !this.menuOpen;
  // }
  //
  // private goto(url: string, newTab = true): void {
  //   this.menuOpen = false;
  //   Utils.goto(url, newTab);
  // }
  //
  // private async resetDeals() {
  //   if (process.env.FIREBASE_ENVIRONMENT !== "production") {
  //     await (await import("../server-browser-scripts/seed-data")).resetDeals((jsonDocs as any[]).map(doc => doc.default ?? doc));
  //   }
  // }
  //
  // private navigate(href: string): void {
  //   this.menuOpen = false;
  //   this.router.load(href);
  // }

  private handleShowWalletMenu(): void {
    this.showWalletMenu();
  }
}
