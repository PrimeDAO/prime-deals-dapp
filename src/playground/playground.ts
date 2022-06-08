import { IRoute } from "@aurelia/router";
export class Playground {
  static routes: IRoute[] = [
    {
      id: "playgroundWelcome",
      path: "",
      component: import("./playgroundWelcome/playgroundWelcome"),
    }];
}
