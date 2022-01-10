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
      {
        route: ["pselect"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pselectDemo"),
        name: "pselect",
        title: "pSelect Demo",
      },
      {
        route: ["pinput-numeric"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pInputNumericDemo.html"),
        name: "pinput-numeric",
        title: "pInput Numeric Demo",
      },
      {
        route: ["pinput-text"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pInputTextDemo.html"),
        name: "pinput-text",
        title: "pInput Text Demo",
      },
      {
        route: ["pinput-textarea"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pInputTextAreaDemo.html"),
        name: "pinput-textarea",
        title: "pInput Textarea Demo",
      },
    ];

    config.map(routes);

    this.router = router;
  }
}
