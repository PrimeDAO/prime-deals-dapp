import { IEventAggregator, inject } from "aurelia";
import { IRouter, IRouteableComponent, IRoute } from "@aurelia/router";
import { DocsRouteProvider } from "documentation/docsRouteProvider";

// @singleton(false)
@inject()
export class Documentation implements IRouteableComponent {

  constructor(
    @IRouter private router: IRouter,
    @IEventAggregator readonly eventAggregator: IEventAggregator,
    readonly docsRouteProviderService: DocsRouteProvider ) {

    this.numDocs = docsRouteProviderService.numDocs;
    this.routes = docsRouteProviderService.routes;

    this.eventAggregator.subscribe("au:router:location-change", (payload: any) => {
      console.dir(payload);
    });
  }

  static title = "Documentation";
  static routes: Array<IRoute>;
  private numDocs: number;
  private _routes: Array<IRoute>;

  get routes(): Array<IRoute> {
    return this._routes;
  }

  set routes(value: Array<IRoute>) {
    this._routes = Documentation.routes = value;
  }

  get nextDocTitle(): string {
    // const docNumber = this.router.currentInstruction.config.data.docNumber;
    // if (docNumber < this.numDocs) {
    //   return this.router.routes[docNumber + 1].title;
    // } else {
    //   return "";
    // }
    return "";
  }

  get previousDocTitle(): string {
    // const docNumber = this.router.currentInstruction.config.data.docNumber;
    // if (docNumber > 1) {
    //   return this.router.routes[docNumber - 1].title;
    // } else {
    //   return "";
    // }
    return "";
  }

  // attached() {
  //   // this.router.load(Documentation.routes[0]);
  //   this.router.load("/documentation/GETTINGSTARTED");
  // }

  next(): void {
    // const docNumber = this.router.currentInstruction.config.data.docNumber;
    // if (docNumber < this.numDocs) {
    //   // @ts-ignore
    //   this.router.load(this.router.routes[docNumber + 1].route);
    // }
  }

  previous(): void {
    // const docNumber = this.router.currentInstruction.config.data.docNumber;
    // if (docNumber > 1) {
    //   // @ts-ignore
    //   this.router.navigate(this.router.routes[docNumber - 1].route);
    // }
  }
}
