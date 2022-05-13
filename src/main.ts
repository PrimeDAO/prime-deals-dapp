import { FirestoreDealsService } from "./services/FirestoreDealsService";
import { PinataIpfsClient } from "./services/PinataIpfsClient";
import { Aurelia } from "aurelia-framework";
import * as environment from "../config/environment.json";
import { PLATFORM } from "aurelia-pal";
import { AllowedNetworks, EthereumService, Networks } from "services/EthereumService";
import { EventConfigException } from "services/GeneralEvents";
import { ConsoleLogService } from "services/ConsoleLogService";
import { ContractsService } from "services/ContractsService";
import { EventAggregator } from "aurelia-event-aggregator";
import { IpfsService } from "services/IpfsService";
import { HTMLSanitizer } from "aurelia-templating-resources";
import DOMPurify from "dompurify";
import { ContractsDeploymentProvider } from "services/ContractsDeploymentProvider";
import { TimingService } from "services/TimingService";
import { TokenService } from "services/TokenService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import "./services/ValidationService";
import { EthereumServiceTesting } from "services/EthereumServiceTesting";
import { FirestoreService } from "services/FirestoreService";
import { ValidationService } from "./services/ValidationService";
import { DealService } from "services/DealService";
import { initialize as initializeMarkdown} from "resources/elements/markdown/markdown";

export function configure(aurelia: Aurelia): void {
  // Note, this Cypress hack has to be at the very start.
  // Reason: Imports in eg. /resources/index, where EthereumService is imported to
  //   /binding-behaviors results in EthereumService not being mocked "in time" for Cypress.
  if ((window as any).Cypress) {
    /**
     * Mock wallet connection
     */
    aurelia.use.singleton(EthereumService, EthereumServiceTesting);
    (window as any).Cypress.eventAggregator = aurelia.container.get(EventAggregator);
  }

  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"))
    .feature(PLATFORM.moduleName("resources/elements/primeDesignSystem/index"))
    .plugin(PLATFORM.moduleName("aurelia-animator-css"))
    .plugin(PLATFORM.moduleName("aurelia-validation"))
    .plugin(PLATFORM.moduleName("aurelia-dialog"), (configuration) => {
      // custom configuration
      configuration.settings.keyboard = false;
    });
  aurelia.use.singleton(HTMLSanitizer, DOMPurify);
  aurelia.use.singleton(IDataSourceDeals, FirestoreDealsService);

  const network = process.env.NETWORK as AllowedNetworks;
  const inDev = process.env.NODE_ENV === "development";

  if (inDev) {
    aurelia.use.developmentLogging(); // everything
  } else {
    aurelia.use.developmentLogging("warn"); // only errors and warnings
  }

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  aurelia.start().then(async () => {
    aurelia.container.get(ConsoleLogService);
    try {

      aurelia.container.registerTransient(DealTokenSwap);

      /**
       * this is how you have to obtain the instance of DOMPurifier that will
       * be used by the app.
       */
      initializeMarkdown(aurelia.container.get(HTMLSanitizer));

      /**
       * ! The order of when the below injection is happening is important!
       *   Before, it was in the upper `window.Cypress` block, and it threw errors around
       *   "BindingLanguage must implement inspectTextContent()."
       */
      if ((window as any).Cypress) {
        /**
         * Mock wallet connection
         */
        /**
         * Tests can directly access FirestoreDealsService.
         * We want that to, eg. get dealIds from the dealsArray
         *
         * Architecure note: Ideally, we want to decouple Test setup code.
         *   Because this requires a bit more investigation on the Cypress<>Webpack side,
         *   this is the quickest compromise for prioritizing test coverage.
         *   Once we have a solid test coverage, it will be easier to explore more solid patters
         */
        const firestoreService = aurelia.container.get(FirestoreService);
        (window as any).Cypress.firestoreService = firestoreService;
        const dataSourceDeals = aurelia.container.get(FirestoreDealsService);
        (window as any).Cypress.dataSourceDeals = dataSourceDeals;
      }

      const ethereumService = aurelia.container.get(EthereumService);
      ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));

      ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);

      aurelia.container.get(ContractsService);

      aurelia.container.get(ValidationService);

      const ipfsService = aurelia.container.get(IpfsService);
      ipfsService.initialize(aurelia.container.get(PinataIpfsClient));

      TimingService.start("TokenService Initialization");
      const tokenService = aurelia.container.get(TokenService);
      await tokenService.initialize();
      TimingService.end("TokenService Initialization");

      /**
       * DealService needs to be instantiated after(!) ContractsService.
       */
      if ((window as any).Cypress) {
        const dealService = aurelia.container.get(DealService);
        (window as any).Cypress.dealService = dealService;
      }
    } catch (ex) {
      const eventAggregator = aurelia.container.get(EventAggregator);
      eventAggregator.publish("handleException", new EventConfigException("Sorry, couldn't connect to ethereum", ex));
      alert(`Sorry, couldn't connect to ethereum: ${ex.message}`);
    }
    aurelia.setRoot(PLATFORM.moduleName("app"));
  });
}
