import { IContainer, IRouter, IRouteViewModel } from "aurelia";
import { ContractsDeploymentProvider } from "services/ContractsDeploymentProvider";
import { DealService } from "services/DealService";
import { AllowedNetworks, EthereumService, IEthereumService, Networks } from "services/EthereumService";
import { TokenService } from "services/TokenService";
import { routes } from "./routes";
import { ContractsService } from "services/ContractsService";
import { IpfsService } from "services/IpfsService";
import { PinataIpfsClient } from "services/PinataIpfsClient";
// import { initialize as initializeMarkdown} from "resources/elements/markdown/markdown";
// import { HTMLSanitizer } from "aurelia-templating-resources";
// import DOMPurify from "dompurify";

export class App implements IRouteViewModel {
  static title = "Prime Deals";
  static routes = routes;

  showingMobileMenu = false;
  showingWalletMenu = false;

  constructor(
    @IRouter protected router: IRouter,
    @IContainer private container: IContainer,
    @IEthereumService private ethereumService: IEthereumService,
  ) {
  }

  async created() {
    const network = process.env.NETWORK as AllowedNetworks;
    const inDev = process.env.NODE_ENV === "development";

    /**
       * this is how you have to obtain the instance of DOMPurifier that will
       * be used by the app.
       */
    //initializeMarkdown(this.container.get(HTMLSanitizer));

    this.ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));
    ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);

    this.container.get(ContractsService);

    // this.container.get(ValidationService);

    const ipfsService = this.container.get(IpfsService);
    ipfsService.initialize(this.container.get(PinataIpfsClient));

    const tokenService = this.container.get(TokenService);
    await tokenService.initialize();
    await this.ethereumService.connectToConnectedProvider();
    const dealsService = this.container.get(DealService);
    dealsService.initialize();
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

  // TODO: fix navigation behavior. Apply event subscriptions.
  // load(params: Params, next: RouteNode, current: RouteNode | null) {
  //   this.onNavigate();
  //   this.router.load(next);
  // }
}
