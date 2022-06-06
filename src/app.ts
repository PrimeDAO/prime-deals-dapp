import DOMPurify from "dompurify";
import { DialogDeactivationStatuses, IEventAggregator } from "aurelia";
import {IRouteableComponent, IRouter} from "@aurelia/router";
import { ContractsDeploymentProvider } from "services/ContractsDeploymentProvider";
import { DealService } from "services/DealService";
import { AllowedNetworks, EthereumService, IEthereumService, Networks } from "services/EthereumService";
import { TokenService } from "services/TokenService";
import { routes } from "./routes";
import { ContractsService } from "services/ContractsService";
import { IpfsService } from "services/IpfsService";
import { PinataIpfsClient } from "services/PinataIpfsClient";
import { EventConfigException } from "services/GeneralEvents";
import { ConsoleLogService } from "services/ConsoleLogService";
import { BrowserStorageService } from "services/BrowserStorageService";
import tippy from "tippy.js";
import { AlertService, ShowButtonsEnum } from "services/AlertService";
import { ComingSoon } from "./comingSoon/comingSoon";
import { initialize as initializeMarkdown} from "resources/elements/markdown/markdown";
import { DocsRouteProvider } from "documentation/docsRouteProvider";
import { IPlatform } from "@aurelia/runtime-html";

export const AppStartDate = new Date("2022-05-16T14:00:00.000Z");

export class App implements IRouteableComponent {
  static title = "Prime Deals";
  static routes = routes;

  private onOff = false;
  private onOffStack = 0;
  private modalMessage: string;
  private initializing = true;
  private showingMobileMenu = false;
  private showingWalletMenu = false;
  private intervalId: any;
  private showCountdownPage = false;
  private comingSoon = ComingSoon;
  private errorHandler = (ex: unknown): boolean => {
    this.eventAggregator.publish("handleException", new EventConfigException("Sorry, an unexpected error occurred", ex));
    return false;
  };
  dealLoadingPromise: Promise<void>;

  constructor(
    @IRouter private router: IRouter,
    @IEthereumService private ethereumService: IEthereumService,
    @IEventAggregator private eventAggregator: IEventAggregator,
    private consoleLogService: ConsoleLogService,
    private alertService: AlertService,
    private storageService: BrowserStorageService,
    private readonly tokenService : TokenService,
    private readonly ipfsService : IpfsService,
    private readonly docsRouteProvider : DocsRouteProvider,
    private readonly dealsService : DealService,
    private readonly pinataIpfsClient : PinataIpfsClient,
    private readonly domPurify : DOMPurify,
    private readonly contractsService : ContractsService,
    @IPlatform private readonly platform: IPlatform,
  ) {
  }

  async binding() {
    this.modalMessage = "Thank you for your patience while we initialize for a few moments...";
    this.handleOnOff(true);
    const network = process.env.NETWORK as AllowedNetworks;
    const inDev = process.env.NODE_ENV === "development";

    /**
       * this is how you have to obtain the instance of DOMPurifier that will
       * be used by the app.
       */
    initializeMarkdown(this.domPurify);
    this.ethereumService.initialize(network ?? (inDev ? Networks.Rinkeby : Networks.Mainnet));
    ContractsDeploymentProvider.initialize(EthereumService.targetedNetwork);
    this.contractsService.setup();
    this.tokenService.setup();
    this.ipfsService.initialize(this.pinataIpfsClient);
    this.tokenService.initialize();
    this.docsRouteProvider.initialize();
    await this.ethereumService.connectToConnectedProvider();
    this.dealLoadingPromise = this.dealsService.initialize();
  }

  async attached(): Promise<void> {

    this.platform.document.querySelector("body").classList.remove("loading");

    // so all elements with data-tippy-content will automatically have a tooltip
    tippy("[data-tippy-content]");

    window.addEventListener("error", this.errorHandler);

    this.platform.document.addEventListener("scroll", (_e) => {
      this.handleScrollEvent();
    });

    // this.eventAggregator.subscribe("deals.loading", async (config: {onOff: boolean, message?: string}) => {
    //   this.modalMessage = config.message || "Thank you for your patience while we initialize for a few moments...";
    //   this.handleOnOff(config.onOff);
    // });

    this.eventAggregator.subscribe("deal.saving", async (onOff: boolean) => {
      this.modalMessage = "Thank you for your patience while we register the information about your deal...";
      this.handleOnOff(onOff);
    });

    this.eventAggregator.subscribe("deal.cancelling", async (onOff: boolean) => {
      this.modalMessage = "Thank you for your patience while we cancel your deal...";
      this.handleOnOff(onOff);
    });

    this.eventAggregator.subscribe("transaction.sent", async () => {
      this.modalMessage = "Awaiting confirmation...";
      this.handleOnOff(true);
    });

    this.eventAggregator.subscribe("transaction.confirmed", async () => {
      this.handleOnOff(false);
    });

    this.eventAggregator.subscribe("transaction.failed", async () => {
      this.handleOnOff(false);
    });

    this.eventAggregator.subscribe("Network.wrongNetwork", async (info: { provider: any, connectedTo: string, need: string }) => {
      let notChanged = true;
      const connect = await this.alertService.showAlert( {
        message: `You are connecting to ${info.connectedTo ?? "an unknown network"}, but to interact with launches we need you to connect to ${info.need}.  Do you want to switch your connection ${info.need} now?`,
        // eslint-disable-next-line no-bitwise
        buttons: ShowButtonsEnum.Primary | ShowButtonsEnum.Secondary,
        buttonTextPrimary: "Yes, Please",
        buttonTextSecondary: "Not Now" });

      if (connect.status === DialogDeactivationStatuses.Ok) {
        if (await this.ethereumService.switchToTargetedNetwork(info.provider)) {
          notChanged = false;
        }
      }

      if (notChanged) {
        this.ethereumService.disconnect({ code: -1, message: "wrong network" });
        this.eventAggregator.publish("handleFailure", `Please connect to ${info.need}`);
      }
    });

    this.eventAggregator.subscribe("database.account.signature.successful", () => {
      this.modalMessage = "Thank you for your patience while we initialize for a few moments...";
    });

    this.eventAggregator.subscribe("database.account.signature.cancelled", () => {
      this.modalMessage = "Thank you for your patience while we initialize for a few moments...";
      this.alertService.showAlert({
        header: "Authentication failure",
        message: "<p>You didn't sign the authentication message. You will only see public deals and you won't be able to edit your deals.</p>",
      });
    });

    this.intervalId = setInterval(async () => {
      const blockDate = this.ethereumService.lastBlock?.blockDate;
      if (blockDate) {
        this.eventAggregator.publish("secondPassed", {blockDate, now: new Date()});
      }
    }, 1000);

    const getShowCountdownPage = () =>
      (
        (window.location.hostname.toLowerCase() === "deals.prime.xyz") &&
      (process.env.NODE_ENV === "production") &&
      (process.env.NETWORK === "mainnet")
      ) ?
        (Date.now() < AppStartDate.getTime()) : false;

    this.showCountdownPage = getShowCountdownPage();

    if (this.showCountdownPage) {
      this.intervalId = setInterval(() => {
        this.showCountdownPage = getShowCountdownPage();
        if (!this.showCountdownPage) {
          clearInterval(this.intervalId);
        }
      }, 1000);
    }
    window.addEventListener("resize", () => { this.showingMobileMenu = false; });
    await this.dealLoadingPromise;
    this.handleOnOff(false);
  }

  private handleOnOff(onOff: boolean): void {
    this.onOffStack += onOff ? 1 : -1;
    if (this.onOffStack < 0) {
      this.onOffStack = 0;
      this.consoleLogService.logMessage("underflow in onOffStack", "warn");
    }
    if (this.onOffStack && !this.onOff) {
      this.onOff = true;
    } else if ((this.onOffStack === 0) && this.onOff) {
      this.onOff = false;
    }
  }

  private getScrollStateKey(fragment: string): string {
    switch (fragment) {
      case "":
      case "/":
      case "/home":
        return "scroll-/home";
      default:
        return `scroll-${fragment}`;
    }
  }

  /**
   * store the scroll position per each page
   */
  private handleScrollEvent(): void {
    // au2 TODO --dkent: restore this when can reproduce this.router.currentInstruction.fragment
    // this.storageService.ssSet(this.getScrollStateKey(this.router.currentInstruction.fragment),
    //   `${window.scrollX},${window.scrollY}`);
  }

  private onNavigate(): void {
    this.showingMobileMenu = false;
  }

  private toggleMobileMenu(): void {
    this.showingMobileMenu = !this.showingMobileMenu;
  }

  private handleShowWalletMenu(): void {
    this.showingWalletMenu = true;
  }

  // TODO: fix navigation behavior. Apply event subscriptions.
  // load(params: Params, next: RouteNode, current: RouteNode | null) {
  //   this.onNavigate();
  //   this.router.load(next);
  // }
}
