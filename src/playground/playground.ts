import { PLATFORM } from "aurelia-pal";
import { RouterConfiguration } from "aurelia-router";

export class Playground {
  private configureRouter(config: RouterConfiguration): void {
    config.map([
      {
        name: "playgroundWelcome",
        route: "",
        moduleId: PLATFORM.moduleName("./playgroundWelcome/playgroundWelcome"),
        nav: true,
      },
    ]);
  }
}
