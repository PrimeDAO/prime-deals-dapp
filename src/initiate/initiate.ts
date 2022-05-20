import { inject, IRouter, IRouteViewModel } from "aurelia";

@inject()
export class Initiate implements IRouteViewModel {
  constructor(@IRouter private router: IRouter) { }

  navigate(slug: string): void {
    this.router.load(slug);
  }
}
