import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";

export class Demos {

  router: Router;

  private configureRouter(config: RouterConfiguration, router: Router) {
    const routes = [
      {
        route: ["pbutton"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pbuttonDemo"),
        name: "pbutton",
        title: "pButton Demo",
      },
    ];

    config.map(routes);

    this.router = router;
  }
}
