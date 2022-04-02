import { PLATFORM } from "aurelia-pal";
import { Router, RouterConfiguration } from "aurelia-router";
import "./demos.scss";

export class Demos {

  router: Router;

  private configureRouter(config: RouterConfiguration, router: Router) {
    const routes = [
      {
        route: ["", "pbutton"],
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
        route: ["pcard"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pcardDemo"),
        name: "pcard",
        title: "pCard Demo",
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
        route: ["ptextarea"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pTextareaDemo.html"),
        name: "ptextarea",
        title: "pTextarea Demo",
      },
      {
        route: ["pcircled-number"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pcircledNumberDemo"),
        name: "pcircled-number",
        title: "pcircled-number Demo",
      },
      {
        route: ["pstepper"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pstepperDemo"),
        name: "pstepper",
        title: "pstepper Demo",
      },
      {
        route: ["pform-input"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pFormInputDemo.html"),
        name: "pform-input",
        title: "pform-input Demo",
      },
      {
        route: ["ptoggle"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pToggleDemo.html"),
        name: "ptoggle",
        title: "ptoggle Demo",
      },
      {
        route: ["pinput-group"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pInputGroupDemo.html"),
        name: "pinput-group",
        title: "pinput-group Demo",
      },
      {
        route: ["pcountdown-circular"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pCountdownCircularDemo"),
        name: "pcountdown-circular",
        title: "pcountdown-circular",
      },
      {
        route: ["prange-slider"],
        nav: true,
        moduleId: PLATFORM.moduleName("./prangeSliderDemo.html"),
        name: "prange-slider",
        title: "prange-slider",
      },
      {
        route: ["pprogress-bar"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pprogressBarDemo.html"),
        name: "pprogress-bar",
        title: "pprogress-bar",
      },
      {
        route: ["pchip"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pchipDemo.html"),
        name: "pchip",
        title: "pchip",
      },
      {
        route: ["pgrid"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pgridDemo"),
        name: "pgrid",
        title: "pgrid",
      },
      {
        route: ["pCountdown-closebuttonDemo"],
        nav: true,
        moduleId: PLATFORM.moduleName("./pCountdownClosebuttonDemo"),
        name: "pcountdown-closebutton",
        title: "pcountdown-closebutton",
      },
      {
        route: ["ppopup-notification"],
        nav: true,
        moduleId: PLATFORM.moduleName("./ppopupNotificationDemo"),
        name: "ppopup-notification",
        title: "ppopup-notification",
      },
      {
        route: ["ppopup-modal"],
        nav: true,
        moduleId: PLATFORM.moduleName("./ppopupModalDemo"),
        name: "ppopup-modal",
        title: "ppopup-modal",
      },
    ];

    config.map(routes);

    this.router = router;
  }
}
