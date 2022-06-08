import { IRoute } from "@aurelia/router";
import axios from "axios";
const marked = require("marked").marked;

export class DocsRouteProvider {

  private markdowns: Array<Promise<any>> = [null];
  public routes: Array<IRoute> = []; //  = new Array<Routeable>();
  public numDocs: number;

  public async initialize(): Promise<void> {

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

    const routes = documentsSpec.map((docspec: {title: string, url: string }, ndx: number) => {
      const id = docspec.title.replaceAll(" ", "");
      const route = {
        path: [id],
        id,
        component: import("./baseDocument"),
        title: docspec.title,
        transitionPlan: "invoke-lifecycles",
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
  }
}
