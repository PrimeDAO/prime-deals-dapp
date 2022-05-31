import { inject, IRouteViewModel } from "aurelia";
import { IRouter } from "@aurelia/router";

@inject()
export class Initiate implements IRouteViewModel {
  constructor(@IRouter private router: IRouter) { }

  navigate(slug: string): void {
    this.router.load(slug);
  }
}
