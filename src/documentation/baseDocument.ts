import { IRouteableComponent, Navigation, RoutingInstruction, Parameters} from "@aurelia/router";

export class BaseDocument implements IRouteableComponent {
  content: string;
  title: string;

  load(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation){
    this.title = navigation.title;
  }

}
