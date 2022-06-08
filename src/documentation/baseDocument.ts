import { IRouteableComponent, Navigation, RoutingInstruction, Parameters } from "@aurelia/router";
import { markdowns } from "./common";

export class BaseDocument implements IRouteableComponent {
  content: string;
  title: string;

  async load(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation) {
    this.title = navigation.title;
    this.content = await markdowns[Number(parameters.docNumber)];
  }
}
