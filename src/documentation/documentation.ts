import { PLATFORM } from "aurelia-pal";
import { singleton, computedFrom, autoinject } from "aurelia-framework";
import { Router, RouterConfiguration, RouteConfig } from "aurelia-router";
import {activationStrategy } from "aurelia-router";
import axios from "axios";
const marked = require("marked");

import "./documentation.scss";

@singleton(false)
@autoinject
export class Documentation {
  router: Router;
  numDocs: number;
  routes: RouteConfig[];
  markdowns = new Array<Promise<any>>();

  @computedFrom("router.currentInstruction")
  get nextDocTitle(): string {
    const docNumber = this.router.currentInstruction.config.settings.docNumber;
    if (docNumber < this.numDocs) {
      return this.routes[docNumber + 1].title;
    } else {
      return "";
    }
  }

  @computedFrom("router.currentInstruction")
  get previousDocTitle(): string {
    const docNumber = this.router.currentInstruction.config.settings.docNumber;
    if (docNumber > 1) {
      return this.routes[docNumber - 1].title;
    } else {
      return "";
    }
  }

  async configureRouter(config: RouterConfiguration, router: Router): Promise<void> {

    config.title = "Documentation";

    if (!this.routes) {

      let documentsSpec: Array<{ title: string, url: string }>;

      await axios.get(process.env.DOCUMENTS_LIST_CONFIG)
        .then((response) => {
          if (response.data && response.data.documents) {
            documentsSpec = response.data.documents;
          }
        });

      /**
       * preload the markdown or else the pages will load with visible flickering
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
       * navigation strategy to load eadh marked independently for faster page load
       * @param instruction
       * @returns
       */
      const navStrat = async (instruction) => {
        const marked = await this.markdowns[instruction.config.settings.docNumber-1];
        if (!instruction.config.settings.content) {
          return instruction.config.settings.content = marked;
        }
      };

      /**
       * activationStrategy is docspec.filespec so baseDocument will be reactivated on each change
       * in route (see https://aurelia.io/docs/routing/configuration#reusing-an-existing-view-model)
       */
      const routes = documentsSpec.map((docspec: {title: string, url: string }, ndx: number) => {
        const route = {
          route: [docspec.title.replaceAll(" ", "")],
          nav: true,
          moduleId: PLATFORM.moduleName("./baseDocument"),
          title: docspec.title,
          activationStrategy: activationStrategy.replace,
          navigationStrategy: navStrat,
          settings: {
            docNumber: ndx+1,
            content: null,
          },
        };
        if (ndx === 0) {
          route.route.push("");
        }
        return route;
      });

      this.numDocs = documentsSpec.length;
      this.routes = routes;
    }

    config.map(this.routes);

    this.router = router;
  }

  next(): void {
    const docNumber = this.router.currentInstruction.config.settings.docNumber;
    if (docNumber < this.numDocs) {
      // @ts-ignore
      this.router.navigate(this.routes[docNumber + 1].route);
    }
  }

  previous(): void {
    const docNumber = this.router.currentInstruction.config.settings.docNumber;
    if (docNumber > 1) {
      // @ts-ignore
      this.router.navigate(this.routes[docNumber - 1].route);
    }
  }
}
