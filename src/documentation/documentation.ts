import "./documentation.scss";
import { PLATFORM } from "aurelia-pal";
import { singleton } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import {activationStrategy } from "aurelia-router";

@singleton(false)
export class Documentation {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    config.title = "Documentation";

    /**
     * activationStrategy is so baseDocument will be reactivated on each change
     * in route (see https://aurelia.io/docs/routing/configuration#reusing-an-existing-view-model)
     */

    const routes = [
      {
        route: ["", "overview"],
        nav: true,
        moduleId: PLATFORM.moduleName("./baseDocument"),
        title: "Overview",
        activationStrategy: activationStrategy.replace,
        settings: {
          content: require("/src/documentation/overview.md").default,
        },
      },
      {
        route: ["deal-launch"],
        nav: true,
        moduleId: PLATFORM.moduleName("./baseDocument"),
        title: "Deal Details & Benefits",
        activationStrategy: activationStrategy.replace,
        settings: {
          content: require("/src/documentation/dealLaunch.md").default,
        },
      },
      {
        route: ["liquid-launch-lbp"],
        nav: true,
        moduleId: PLATFORM.moduleName("./baseDocument"),
        title: "Liquid Launch Details and Benefits",
        activationStrategy: activationStrategy.replace,
        settings: {
          content: require("/src/documentation/liquidLaunch.md").default,
        },
      },
    ];

    config.map(routes);

    this.router = router;
  }
}
