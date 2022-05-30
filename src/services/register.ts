import { IContainer, IRegistry, Registration } from "aurelia";
import DOMPurify from "dompurify";
import { IEthereumService, EthereumService } from "./EthereumService";
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
    container.register(Registration.singleton(DOMPurify, DOMPurify));
    container.register(Registration.transient(DealTokenSwap, DealTokenSwap));

    return container;
  },
};
