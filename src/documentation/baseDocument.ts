import { singleton } from "aurelia-framework";
import { RouteConfig } from "aurelia-router";
import {activationStrategy, RoutableComponentDetermineActivationStrategy} from "aurelia-router";

@singleton(true)
export class BaseDocument implements RoutableComponentDetermineActivationStrategy {
  content: string;
  title: string;
  activate(_params: unknown, routeConfig: RouteConfig): void {
    this.title = routeConfig.title;
    this.content = routeConfig.settings.content;
  }

  /**
   * so this viewModel will be reactivated on each change
   * in route (see https://aurelia.io/docs/routing/configuration#reusing-an-existing-view-model)
   */
  determineActivationStrategy() {
    return activationStrategy.replace;
  }
}
