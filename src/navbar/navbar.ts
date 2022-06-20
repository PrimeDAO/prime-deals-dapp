import { ContractsDeploymentProvider } from "services/ContractsDeploymentProvider";
import { Utils } from "services/utils";
import { bindable, BindingMode, inject } from "aurelia";
import { IRouter } from "@aurelia/router";

@inject()
export class Navbar {
  @bindable private showWalletMenu?: () => void;
  @bindable private toggleMenu?: () => void;
  @bindable({mode: BindingMode.twoWay}) private menuOpen = false;
  provider = ContractsDeploymentProvider;

  environment = process.env.FIREBASE_ENVIRONMENT;

  constructor(@IRouter private router: IRouter) {
  }

  private goto(url: string, newTab = true): void {
    this.menuOpen = false;
    Utils.goto(url, newTab);
  }

  private async resetDeals() {
    if (process.env.FIREBASE_ENVIRONMENT !== "production") {
      // await (await import("../server-browser-scripts/seed-data")).resetDeals((jsonDocs as any[]).map(doc => doc.default ?? doc));
    }
  }

  private handleShowWalletMenu(): void {
    this.showWalletMenu();
  }
}
