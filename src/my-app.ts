import { IContainer, inject, Registration, IRouter, IRouteViewModel } from "aurelia";
import { routes } from "./routes";
import { AllowedNetworks, EthereumService, Networks } from "services/EthereumService";
import { DealService } from "services/DealService";
import { ContractsDeploymentProvider } from "./services/ContractsDeploymentProvider";
import { FirestoreDealsService } from "services/FirestoreDealsService"
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
import { RouteNode, Params } from "aurelia";

@inject()
export class MyApp implements IRouteViewModel {
  static routes = routes

  constructor(
    @IContainer container: IContainer,
    @IRouter private router: IRouter,
  ) {
    const network = process.env.NETWORK as AllowedNetworks;
    const inDev = process.env.NODE_ENV === "development";

    const ethereumService = container.get(EthereumService);
    ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));
    ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);

    container.register(
      Registration.singleton(IDataSourceDeals, FirestoreDealsService)
      )

    const dealsService = container.get(DealService);
    dealsService.initialize()
  }

  load(params: Params, next: RouteNode, current: RouteNode | null) {
    console.log("Load", params, next, current);
    // this.onNavigate();
    // this.router.load(next);
  }

}
