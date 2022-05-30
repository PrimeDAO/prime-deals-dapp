import { EthereumService } from "services/EthereumService";
import { IEthereumService } from "./EthereumService";
import { IContainer, IRegistry, Registration } from "aurelia";
import { FirestoreDealsService } from "./FirestoreDealsService";
import { IDataSourceDeals } from "./DataSourceDealsTypes";
// import { ConsoleLogService } from "services/ConsoleLogService";
import { DealTokenSwap } from "entities/DealTokenSwap";

export const register: IRegistry = {
  register: (container: IContainer) => {
    /* logging should be done first */
    // container.get(ConsoleLogService);
    container.register(Registration.singleton(IEthereumService, EthereumService));
    container.register(Registration.singleton(IDataSourceDeals, FirestoreDealsService));
    // container.register(Registration.singleton(HTMLSanitizer, DOMPurify));
    container.register(Registration.transient(DealTokenSwap, DealTokenSwap));

    return container;
  },
};
