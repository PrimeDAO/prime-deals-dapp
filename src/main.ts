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
import { DealService } from "services/DealService";
import { IpfsService } from "services/IpfsService";
import { HTMLSanitizer } from "aurelia-templating-resources";
import DOMPurify from "dompurify";
import { ContractsDeploymentProvider } from "services/ContractsDeploymentProvider";
import { TimingService } from "services/TimingService";
import { TokenService } from "services/TokenService";
import { DealTokenSwap } from "entities/DealTokenSwap";
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import "./services/ValidationService";
import { FirebaseService } from "services/FirebaseService";

export function configure(aurelia: Aurelia): void {
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
       * must do before ethereum service, to capture network connections
       */
      const firebaseService = aurelia.container.get(FirebaseService);
      firebaseService.initialize();

      const ethereumService = aurelia.container.get(EthereumService);
      ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));

      ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);

      aurelia.container.get(ContractsService);

      const ipfsService = aurelia.container.get(IpfsService);
      ipfsService.initialize(aurelia.container.get(PinataIpfsClient));

      TimingService.start("TokenService Initialization");
      const tokenService = aurelia.container.get(TokenService);
      await tokenService.initialize();
      TimingService.end("TokenService Initialization");

      const dealService = aurelia.container.get(DealService);
      dealService.initialize();

    } catch (ex) {
      const eventAggregator = aurelia.container.get(EventAggregator);
      eventAggregator.publish("handleException", new EventConfigException("Sorry, couldn't connect to ethereum", ex));
      alert(`Sorry, couldn't connect to ethereum: ${ex.message}`);
    }
    aurelia.setRoot(PLATFORM.moduleName("app"));
  });
}
