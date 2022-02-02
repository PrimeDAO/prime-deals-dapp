import "./documentation.scss";
import { PLATFORM } from "aurelia-pal";
import { singleton } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";

@singleton(false)
export class Documentation {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    config.title = "Documentation";

    const routes = [
      {
        route: ["", "overview"],
        nav: true,
        moduleId: PLATFORM.moduleName("./baseDocument"),
        name: "document1",
        title: "Overview",
        settings: {
          content: require("/src/documentation/overview.md").default,
        },
      },
      {
        route: ["deal-launch"],
        nav: true,
        moduleId: PLATFORM.moduleName("./baseDocument"),
        name: "document2",
        title: "Deal Details & Benefits",
        settings: {
          content: require("/src/documentation/dealLaunch.md").default,
        },
      },
      {
        route: ["liquid-launch-lbp"],
        nav: true,
        moduleId: PLATFORM.moduleName("./baseDocument"),
        name: "document3",
        title: "Liquid Launch Details and Benefits",
        settings: {
          content: require("/src/documentation/liquidLaunch.md").default,
        },
      },
    ];

    config.map(routes);

    this.router = router;
  }
}
