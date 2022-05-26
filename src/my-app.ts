import { IContainer, inject, Registration, IRouter, IRouteViewModel } from "aurelia";
import { routes } from "./routes";
import { AllowedNetworks, EthereumService, Networks } from "services/EthereumService";
import { DealService } from "services/DealService";
import { ContractsDeploymentProvider } from "./services/ContractsDeploymentProvider";
import { FirestoreDealsService } from "services/FirestoreDealsService"
import { IDataSourceDeals } from "services/DataSourceDealsTypes";
// import { RouteNode, Params } from "aurelia";
import { TokenService } from "./services/TokenService";

@inject()
export class MyApp implements IRouteViewModel {
  static title = "Prime Deals"
  static routes = routes

  showingMobileMenu = false;
  showingWalletMenu = false;

  constructor(
    @IRouter protected router: IRouter,
    @IContainer private container: IContainer,
  ) {
  }

  async created() {
    const network = process.env.NETWORK as AllowedNetworks;
    const inDev = process.env.NODE_ENV === "development";

    const ethereumService = this.container.get(EthereumService);
    ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));
    ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);
    const tokenService = this.container.get(TokenService);
    await tokenService.initialize();
    await ethereumService.connectToConnectedProvider();

    this.container.register(
      Registration.singleton(IDataSourceDeals, FirestoreDealsService)
    )

    const dealsService = this.container.get(DealService);
      dealsService.initialize()
  }

  onNavigate(): void {
    this.showingMobileMenu = false;
  }

  toggleMobileMenu(): void {
    this.showingMobileMenu = !this.showingMobileMenu;
  }

  handleShowWalletMenu(): void {
    this.showingWalletMenu = true;
  }

  // load(params: Params, next: RouteNode, current: RouteNode | null) {
  //   this.onNavigate();
  //   this.router.load(next);
  // }
}
