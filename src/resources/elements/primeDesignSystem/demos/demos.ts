import {PLATFORM} from "aurelia-pal";
import {Router, RouterConfiguration} from "aurelia-router";

export class Demos {

  router: Router;

  private configureRouter(config: RouterConfiguration, router: Router): void {
    config.map([
      {
        name: "demosWelcome",
        route: "",
        moduleId: PLATFORM.moduleName("./demosWelcome/demosWelcome"),
        nav: true,
      },
    ]);
    this.router = router;
  }
}
