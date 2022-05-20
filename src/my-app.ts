import { IContainer, inject, IRouteViewModel } from "aurelia";
import { routes } from "./routes";
import { AllowedNetworks, EthereumService, Networks } from "./services/EthereumService";
import { ContractsDeploymentProvider } from "./services/ContractsDeploymentProvider";

@inject()
export class MyApp implements IRouteViewModel {
  static routes = routes

  constructor(@IContainer container: IContainer) {
    const network = process.env.NETWORK as AllowedNetworks;
    const inDev = process.env.NODE_ENV === "development";

    const ethereumService = container.get(EthereumService);
    ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));

    ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);

  }
}
