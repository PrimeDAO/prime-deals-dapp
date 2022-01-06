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

export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"))
    .feature(PLATFORM.moduleName("resources/elements/primeDesignSystem/index"))
    .plugin(PLATFORM.moduleName("aurelia-animator-css"))
    .plugin(PLATFORM.moduleName("aurelia-dialog"), (configuration) => {
      // custom configuration
      configuration.settings.keyboard = false;
    });
  aurelia.use.singleton(HTMLSanitizer, DOMPurify);

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

      const ethereumService = aurelia.container.get(EthereumService);
      ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));

      ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);

      aurelia.container.get(ContractsService);

      const dealService = aurelia.container.get(DealService);
      dealService.initialize();
      dealService.getDAOsInformation();

      const ipfsService = aurelia.container.get(IpfsService);
      ipfsService.initialize(aurelia.container.get(PinataIpfsClient));
    } catch (ex) {
      const eventAggregator = aurelia.container.get(EventAggregator);
      eventAggregator.publish("handleException", new EventConfigException("Sorry, couldn't connect to ethereum", ex));
      alert(`Sorry, couldn't connect to ethereum: ${ex.message}`);
    }
    aurelia.setRoot(PLATFORM.moduleName("app"));
  });
}
