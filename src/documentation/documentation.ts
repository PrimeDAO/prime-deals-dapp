import axios from "axios";
const marked = require("marked");

import { IRouter} from "@aurelia/router";

export class Documentation {
  numDocs: number;
  markdowns: Array<Promise<any>> = [null];

  constructor(@IRouter private readonly router: IRouter){}

  // get nextDocTitle(): string {
  //   const docNumber = this.router.currentInstruction.config.settings.docNumber;
  //   if (docNumber < this.numDocs) {
  //     return this.router.routes[docNumber + 1].title;
  //   } else {
  //     return "";
  //   }
  // }

  // get previousDocTitle(): string {
  //   const docNumber = this.router.currentInstruction.config.settings.docNumber;
  //   if (docNumber > 1) {
  //     return this.router.routes[docNumber - 1].title;
  //   } else {
  //     return "";
  //   }
  // }

  // async configureRouter(config: RouterConfiguration, router: Router): Promise<void> {

  //   config.title = "Documentation";

  //   if (!this.routes) {

  //     let documentsSpec: Array<{ title: string, url: string }>;

  //     await axios.get(process.env.DOCUMENTS_LIST_CONFIG)
  //       .then((response) => {
  //         if (response.data && response.data.documents) {
  //           documentsSpec = response.data.documents;
  //         }
  //       });

  //     /**
  //      * get all the pages started loading, asynchronously.
  //      * If we let the markdown component load these itself, there would be
  //      * a lot of flickering as the markdown unloads and reloads itself
  //      */
  //     for (const doc of documentsSpec) {
  //       this.markdowns.push(axios.get(doc.url)
  //         .then((response) => {
  //           if (response.data && response.data.length) {
  //             return marked(response.data);
  //           }
  //         }));
  //     }

  //     /**
  //      * navigation strategy to await each marked on demand
  //      * @param instruction
  //      * @returns
  //      */
  //     const navStrat = async (instruction) => {
  //       const marked = await this.markdowns[instruction.config.settings.docNumber];
  //       if (!instruction.config.settings.content) {
  //         return instruction.config.settings.content = marked;
  //       }
  //     };

  //     /**
  //      * activationStrategy is docspec.filespec so baseDocument will be reactivated on each change
  //      * in route (see https://aurelia.io/docs/routing/configuration#reusing-an-existing-view-model)
  //      */
  //     const routes = documentsSpec.map((docspec: {title: string, url: string }, ndx: number) => {
  //       const route = {
  //         route: [docspec.title.replaceAll(" ", "")],
  //         nav: true,
  //         moduleId: PLATFORM.moduleName("./baseDocument"),
  //         title: docspec.title,
  //         activationStrategy: activationStrategy.replace,
  //         navigationStrategy: navStrat,
  //         settings: {
  //           docNumber: ndx+1,
  //           content: null,
  //         },
  //       };
  //       /**
  //        * specify as default route
  //        */
  //       if (ndx === 0) {
  //         route.route.push("");
  //       }
  //       return route;
  //     });

  //     this.numDocs = documentsSpec.length;
  //     this.routes = routes;
  //   }

  //   config.map(this.routes);

  //   this.router = router;
  // }

  // next(): void {
  //   const docNumber = this.router.currentInstruction.config.settings.docNumber;
  //   if (docNumber < this.numDocs) {
  //     // @ts-ignore
  //     this.router.navigate(this.router.routes[docNumber + 1].route);
  //   }
  // }

  // previous(): void {
  //   const docNumber = this.router.currentInstruction.config.settings.docNumber;
  //   if (docNumber > 1) {
  //     // @ts-ignore
  //     this.router.navigate(this.router.routes[docNumber - 1].route);
  //   }
  // }
}
