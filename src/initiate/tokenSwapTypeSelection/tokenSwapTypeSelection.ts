import { inject } from "aurelia";
import { IRouter } from "@aurelia/router";

@inject()
export class TokenSwapTypeSelection {
  constructor(@IRouter private router: IRouter) { }

  navigate(slug: string): void {
    this.router.load(slug);
  }
}
