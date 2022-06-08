import { ICustomElementViewModel } from "aurelia";
import { IRouter, IRouteableComponent, IRoute } from "@aurelia/router";
import axios from "axios";
import { marked } from "marked";

import { markdowns } from "./common";
export class Documentation implements IRouteableComponent, ICustomElementViewModel {
  static routes: IRoute[] = [];
  routes = Documentation.routes;
  default: string | string[];
  constructor(
    @IRouter private router: IRouter,
  ) { }

  static title = "Documentation";
  numDocs: number;

  // get nextDocTitle(): string {
  //   if (!this.router.activeNavigation) return "";
  //   const docNumber = Number(this.router.activeNavigation.parameters.docNumber);
  //   if (docNumber < this.numDocs) {
  //     return Documentation.routes[docNumber + 1].title;
  //   } else {
  //     return "";
  //   }
  // }

  // get previousDocTitle(): string {
  //   const docNumber = Number(this.router.activeNavigation.parameters.docNumber);
  //   if (docNumber > 1) {
  //     return Documentation.routes[docNumber - 1].title;
  //   } else {
  //     return "";
  //   }
  // }

  async load(): Promise<void> {

    if (Documentation.routes.length) return;

    let documentsSpec: Array<{ title: string, url: string }>;

    const response = await axios.get(process.env.DOCUMENTS_LIST_CONFIG);
    if (response.data && response.data.documents) {
      documentsSpec = response.data.documents;
    }

    /**
     * get all the pages started loading, asynchronously.
     * If we let the markdown component load these itself, there would be
     * a lot of flickering as the markdown unloads and reloads itself
     */
    for (const doc of documentsSpec) {
      markdowns.push(axios.get(doc.url)
        .then((response) => {
          if (response.data && response.data.length) {
            return marked(response.data);
          }
        }));
    }

    const navRoutes = documentsSpec.map((docspec: { title: string, url: string }, ndx: number) => {
      const route: IRoute = {
        path: docspec.title.replaceAll(" ", ""),
        component: import("./baseDocument"),
        title: docspec.title,
        viewport: "documents",
        parameters: {
          docNumber: ndx,
          content: null,
        },
      };
      if (ndx === 0) {
        this.default = route.path;
      }
      return route;
    });

    Documentation.routes.push(...navRoutes);

    this.numDocs = documentsSpec.length;
  }

  next(): void {
    const docNumber = Number(this.router.activeNavigation.parameters.docNumber);
    if (docNumber < this.numDocs) {
      this.router.load(Documentation.routes[docNumber + 1].path);
    }
  }

  previous(): void {
    const docNumber = Number(this.router.activeNavigation.parameters.docNumber);
    if (docNumber > 1) {
      this.router.load(Documentation.routes[docNumber - 1].path);
    }
  }
}
