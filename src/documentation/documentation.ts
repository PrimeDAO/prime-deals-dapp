import { IEventAggregator, inject } from "aurelia";
import { IRouter, IRouteableComponent, IRoute } from "@aurelia/router";
import axios from "axios";
const marked = require("marked").marked;

// @singleton(false)
@inject()
export class Documentation implements IRouteableComponent {

  constructor(
    @IRouter private router: IRouter,
    @IEventAggregator readonly eventAggregator: IEventAggregator,
  ) {}

  static title = "Documentation";
  static routes: Array<IRoute> = []; //  = new Array<Routeable>();
  numDocs: number;
  markdowns: Array<Promise<any>> = [null];

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

  async created(): Promise<void> {

    let documentsSpec: Array<{ title: string, url: string }>;

    await axios.get(process.env.DOCUMENTS_LIST_CONFIG)
      .then((response) => {
        if (response.data && response.data.documents) {
          documentsSpec = response.data.documents;
        }
      });

    /**
       * get all the pages started loading, asynchronously.
       * If we let the markdown component load these itself, there would be
       * a lot of flickering as the markdown unloads and reloads itself
       */
    for (const doc of documentsSpec) {
      this.markdowns.push(axios.get(doc.url)
        .then((response) => {
          if (response.data && response.data.length) {
            return marked(response.data);
          }
        }));
    }

    /**
     * activationStrategy is docspec.filespec so baseDocument will be reactivated on each change
     * in route (see https://aurelia.io/docs/routing/configuration#reusing-an-existing-view-model)
     */
    const routes = documentsSpec.map((docspec: {title: string, url: string }, ndx: number) => {
      const id = docspec.title.replaceAll(" ", "");
      const route = {
        path: [id],
        id,
        component: import("./baseDocument"),
        title: docspec.title,
        transitionPlan: "replace", // "invoke-lifecycles",
        data: {
          docNumber: ndx+1,
          content: this.markdowns[ndx+1], // a promise of markdown content
        },
      };
        /**
         * specify as default route
         */
      if (ndx === 0) {
        route.path.push("");
      }
      return route;
    });

    this.numDocs = documentsSpec.length;
    this.routes = routes;
    // Documentation.routes.push(...routes);

    this.eventAggregator.subscribe("au:router:location-change", (payload: any) => {
      console.dir(payload);
    });
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
