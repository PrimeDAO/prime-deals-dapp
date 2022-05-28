import { IContainer, IRouter, IRouteViewModel } from "aurelia";
import { routes } from "./routes";

export class App implements IRouteViewModel {
  public message = `Hello World from ${process.env.NODE_ENV }!`;
  static title = "Prime Deals"
  static routes = routes;

  showingMobileMenu = false;
  showingWalletMenu = false;

  constructor(
    @IRouter protected router: IRouter,
    @IContainer private container: IContainer,
  ) {
  }

  // async created() {
  //   const network = process.env.NETWORK as AllowedNetworks;
  //   const inDev = process.env.NODE_ENV === "development";

  //   const ethereumService = this.container.get(EthereumService);
  //   ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));
  //   ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);
  //   const tokenService = this.container.get(TokenService);
  //   await tokenService.initialize();
  //   await ethereumService.connectToConnectedProvider();

  //   this.container.register(
  //     Registration.singleton(IDataSourceDeals, FirestoreDealsService)
  //   )

  //   const dealsService = this.container.get(DealService);
  //   dealsService.initialize()
  // }

  onNavigate(): void {
    this.showingMobileMenu = false;
  }

  toggleMobileMenu(): void {
    this.showingMobileMenu = !this.showingMobileMenu;
  }

  handleShowWalletMenu(): void {
    this.showingWalletMenu = true;
  }

  // TODO: fix navigation behavior. Apply event subscriptions.
  // load(params: Params, next: RouteNode, current: RouteNode | null) {
  //   this.onNavigate();
  //   this.router.load(next);
  // }
}
