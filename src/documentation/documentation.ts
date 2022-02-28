import { PLATFORM } from "aurelia-pal";
import { singleton } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import {activationStrategy } from "aurelia-router";

import "./documentation.scss";

@singleton(false)
export class Documentation {
  router: Router;

  async configureRouter(config: RouterConfiguration, router: Router): Promise<void> {
    config.title = "Documentation";

    const documentsSpec = require("./documents.json").documents;

    // const routes = [];
    // let first = true;

    // for (const docspec of documentsSpec) {
    //   const filespec = `./${docspec.filespec}`;
    //   const md = await import(filespec);
    //   const route = {
    //     route: [docspec.title.replace(" ", "-")],
    //     nav: true,
    //     moduleId: PLATFORM.moduleName("./baseDocument"),
    //     title: docspec.title,
    //     activationStrategy: activationStrategy.replace,
    //     settings: {
    //       content: md,
    //     },
    //   };
    //   if (first) {
    //     route.route.push("");
    //     first = false;
    //   }
    //   routes.push(route);
    // }

    // const docsFilesContext = (require as any).context("/src/documentation/documents/", true, /\.md$/);

    /**
     * activationStrategy is docspec.filespecso baseDocument will be reactivated on each change
     * in route (see https://aurelia.io/docs/routing/configuration#reusing-an-existing-view-model)
     */
    const routes = documentsSpec.map((docspec: {title: string, url: string }, ndx: number) => {
      const route = {
        route: [docspec.title.replace(" ", "-")],
        nav: true,
        moduleId: PLATFORM.moduleName("./baseDocument"),
        title: docspec.title,
        activationStrategy: activationStrategy.replace,
        settings: {
          content: docspec.url,
        },
      };
      if (ndx === 0) {
        route.route.push("");
      }
      return route;
    });

    config.map(routes);

    this.router = router;
  }
}
