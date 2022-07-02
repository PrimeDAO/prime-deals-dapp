import { ICustomElementViewModel } from "aurelia";
import { IRoute, IRouteableComponent, IRouter, Navigation } from "@aurelia/router";
import axios from "axios";
import { marked } from "marked";

import { markdowns } from "./common";

export class Documentation implements IRouteableComponent, ICustomElementViewModel {
  static routes: IRoute[] = [];
  private routes = Documentation.routes;
  constructor(
    @IRouter private router: IRouter,
  ) { }

  static title = "Documentation";
  numDocs: number;

  get currentDocIndex (): number {
    if (!this.router.activeNavigation) return -1;
    /**
     * activeNavigation.instruction: string | string[]
     * We know the instruction path, defined by the page title, will always be a single
     * item. Hence can safely converted to a string.
     *  */
    const currentDoc = this.router.activeNavigation.instruction.toString();
    return this.routes.findIndex(
      doc => doc.path === currentDoc.slice(currentDoc.indexOf("/", 1) + 1))/* Clean parent route from path. */;
  }

  get nextDocTitle(): string {
    if (this.currentDocIndex < this.routes.length - 1) {
      return this.routes[this.currentDocIndex + 1]?.title;
    }
    return "";
  }

  get previousDocTitle(): string {
    if (this.currentDocIndex > 0) {
      return this.routes[this.currentDocIndex - 1]?.title;
    }
    return "";
  }

  static async loadRoutes(): Promise<void> {

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
      return route;
    });

    Documentation.routes.push(...navRoutes);
  }

  async navigateTo (routeIndex: number): Promise<void>
  {
    this.router.load(`documentation/${this.routes[routeIndex].path}`);
  }

  next(): void {
    if (this.currentDocIndex < this.routes.length - 1) {
      this.router.load(`documentation/${this.routes[this.currentDocIndex + 1].path}`);
    }
  }

  previous(): void {
    if (this.currentDocIndex > 0) {
      this.router.load(`documentation/${this.routes[this.currentDocIndex - 1].path}`);
    }
  }

  load (_, __, navigation: Navigation): void {
    if (navigation.path) {
      this.router.load(navigation.path);
    } else {
      this.router.load(`documentation/${this.routes[0].path}`);
    }
  }
}
