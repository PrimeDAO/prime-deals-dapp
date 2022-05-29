import { EthereumService } from "services/EthereumService";
import { IEthereumService } from "./EthereumService";
import { IContainer, IRegistry, Registration } from "aurelia";
import { FirestoreDealsService } from "./FirestoreDealsService";
import { IDataSourceDeals } from "./DataSourceDealsTypes";

export const register: IRegistry = {
  register: (container: IContainer) => {
    container.register(Registration.singleton(IEthereumService, EthereumService));
    container.register(Registration.singleton(IDataSourceDeals, FirestoreDealsService));

    return container;
  },
};
