import { IContainer, inject, IRouter, IRouteViewModel } from "aurelia";
import { routes } from "./routes";
import { AllowedNetworks, EthereumService, Networks } from "./services/EthereumService";
import { ContractsDeploymentProvider } from "./services/ContractsDeploymentProvider";
import { TokenService } from "./services/TokenService";

@inject()
export class MyApp implements IRouteViewModel {
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
  }

  onNavigate(): void {
    this.showingMobileMenu = false;
  }

  toggleMobileMenu(): void {
    this.showingMobileMenu = !this.showingMobileMenu;
  }

  navigate(href: string): void {
    this.onNavigate();
    this.router.load(href); // TODO test this
  }

  handleShowWalletMenu(): void {
    this.showingWalletMenu = true;
  }
}
