import { DealService } from "services/DealService";
import "./app.scss";
import { NavigationInstruction, Next, Router, RouterConfiguration } from "aurelia-router";
import { STAGE_ROUTE_PARAMETER, WizardType } from "wizards/tokenSwapDealWizard/dealWizardTypes";
import { AlertService } from "services/AlertService";
import { BindingSignaler } from "aurelia-templating-resources";
import { BrowserStorageService } from "services/BrowserStorageService";
import { ConsoleLogService } from "services/ConsoleLogService";
import { EthereumService } from "services/EthereumService";
import { EventAggregator } from "aurelia-event-aggregator";
import { EventConfigException } from "services/GeneralEvents";
import { PLATFORM } from "aurelia-pal";
import { ShowButtonsEnum } from "resources/elements/primeDesignSystem/ppopup-modal/ppopup-modal";
import { autoinject } from "aurelia-framework";
import tippy from "tippy.js";
import { Utils } from "services/utils";

export const AppStartDate = new Date("2022-05-16T14:00:00.000Z");

@autoinject
export class App {
  constructor (
    private signaler: BindingSignaler,
    private ethereumService: EthereumService,
    private eventAggregator: EventAggregator,
    private consoleLogService: ConsoleLogService,
    private alertService: AlertService,
    private storageService: BrowserStorageService,
    private dealService: DealService,
  ) { }

  router: Router;
  onOff = false;
  onOffStack = 0;
  modalMessage: string;
  initializing = true;
  showingMobileMenu = false;
  showingWalletMenu = false;
  intervalId: any;
  showCountdownPage = false;

  errorHandler = (ex: unknown): boolean => {
    this.eventAggregator.publish("handleException", new EventConfigException("Sorry, an unexpected error occurred", ex));
    return false;
  };

  public async attached(): Promise<void> {
    // so all elements with data-tippy-content will automatically have a tooltip
    tippy("[data-tippy-content]");

    window.addEventListener("error", this.errorHandler);

    document.addEventListener("scroll", (_e) => {
      this.handleScrollEvent();
    });

    this.eventAggregator.subscribe("deals.loading", async (config: {onOff: boolean, message?: string}) => {
      this.modalMessage = config.message || "Thank you for your patience while we initialize for a few moments...";
      this.handleOnOff(config.onOff);
    });

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

      let message = `<p>Your wallet is connected to ${info.connectedTo ?? "an unknown network"}, but to interact with deals we need you to connect to ${info.need}.  Do you want to switch your connection ${info.need} now?<p>`;
      if (await this.ethereumService.isSafeApp()) {
        const networkName = await this.ethereumService.getSafeNetwork();
        message = `<p>The safe is currently on <strong style="font-weight:bold;">${networkName}</strong>, but your wallet is connected to <strong style="font-weight:bold;">${info.connectedTo ?? "an unknown network"}</strong>.`
          + `<p>To interact with deals we need you to connect to <strong style="font-weight:bold;">${info.need}</strong> as well.<p>`
          + `<p>Do you want to switch your wallet connection to <strong style="font-weight:bold;">${info.need}</strong> now?<p>`;
      }

      const connect = await this.alertService.showAlert( {
        message,
        header: "Unsupported network",
        // eslint-disable-next-line no-bitwise
        buttons: ShowButtonsEnum.Primary | ShowButtonsEnum.Secondary,
        buttonTextPrimary: "Yes, Please",
        buttonTextSecondary: "Not Now" });

      if (!connect.wasCancelled && !connect.output) {
        if (await this.ethereumService.switchToTargetedNetwork(info.provider)) {
          notChanged = false;
        }
      }

      if (notChanged) {
        this.ethereumService.disconnect({ code: -1, message: "wrong network" });
        this.eventAggregator.publish("handleFailure", `Please connect your wallet to ${info.need}`);
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
      this.signaler.signal("secondPassed");
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

    /**
     * undo stuff from base.css now that we don't need it
     */
    document.querySelector("body").classList.remove("loading");

    await this.ethereumService.connectToConnectedProvider();

    /**
     * do this after we've gotten an account, if there is one
     */
    this.dealService.initialize();
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

  private configureRouter(config: RouterConfiguration, router: Router) {

    config.title = "Prime Deals";
    config.options.pushState = true;
    // const isIpfs = (window as any).IS_IPFS;
    // if (isIpfs) {
    //   this.consoleLogService.handleMessage(`Routing for IPFS: ${window.location.pathname}`);
    // }
    config.options.root = "/"; // window.location.pathname; // to account for IPFS
    /**
     * first set the landing page.
     * it is possible to be connected but have the wrong chain.
     */
    config.map([
      {
        moduleId: PLATFORM.moduleName("./home/home"),
        nav: true,
        name: "home",
        route: ["", "/", "/home"],
        title: "Home",
      },
      {
        moduleId: PLATFORM.moduleName("./contribute/contribute"),
        nav: true,
        name: "contribute",
        route: "/contribute",
        title: "Contribute",
      },
      {
        moduleId: PLATFORM.moduleName("./wizards/tokenSwapDealWizard/wizardManager"),
        route: `/initiate/token-swap/open-proposal/*${STAGE_ROUTE_PARAMETER}`,
        nav: false,
        name: "createOpenProposal",
        title: "Create an Open Proposal",
        settings: {
          wizardType: WizardType.createOpenProposal,
        },
      },
      {
        moduleId: PLATFORM.moduleName("./wizards/tokenSwapDealWizard/wizardManager"),
        route: `/initiate/token-swap/partnered-deal/*${STAGE_ROUTE_PARAMETER}`,
        nav: false,
        name: "createPartneredDeal",
        title: "Create a Partnered Deal",
        settings: {
          wizardType: WizardType.createPartneredDeal,
        },
      },
      {
        moduleId: PLATFORM.moduleName("./wizards/tokenSwapDealWizard/wizardManager"),
        nav: false,
        name: "makeOfferWizard",
        route: `/make-an-offer/:id/*${STAGE_ROUTE_PARAMETER}`,
        title: "Make an offer",
        settings: {
          wizardType: WizardType.makeAnOffer,
        },
      },
      {
        moduleId: PLATFORM.moduleName("./wizards/tokenSwapDealWizard/wizardManager"),
        nav: false,
        name: "editOpenProposal",
        route: `/open-proposal/:id/edit/*${STAGE_ROUTE_PARAMETER}`,
        title: "Edit an Open Proposal",
        settings: {
          wizardType: WizardType.editOpenProposal,
        },
      },
      {
        moduleId: PLATFORM.moduleName("./wizards/tokenSwapDealWizard/wizardManager"),
        nav: false,
        name: "editPartneredDeal",
        route: `/partnered-deal/:id/edit/*${STAGE_ROUTE_PARAMETER}`,
        title: "Edit a Partnered Deal",
        settings: {
          wizardType: WizardType.editPartneredDeal,
        },
      },
      {
        moduleId: PLATFORM.moduleName("./initiate/tokenSwapTypeSelection/tokenSwapTypeSelection"),
        nav: false,
        name: "tokenSwapTypeSelection",
        route: "/initiate/token-swap",
        title: "Select Token Swap Type",
      },
      {
        moduleId: PLATFORM.moduleName("./initiate/initiate"),
        nav: false,
        name: "initiate",
        route: "/initiate",
        title: "Initiate a Deal",
      },
      {
        moduleId: PLATFORM.moduleName("./deals/list/deals"),
        nav: false,
        name: "deals",
        route: "/deals",
        title: "Deals",
      },
      {
        moduleId: PLATFORM.moduleName("./documentation/documentation"),
        nav: false,
        name: "documentation",
        route: "/documentation",
        title: "Documentation",
      },
      {
        moduleId: PLATFORM.moduleName("./documentation/officialDocs/termsOfService.html"),
        nav: false,
        name: "termsOfService",
        route: ["terms-of-service"],
        title: "Terms of Service",
      },
      {
        moduleId: PLATFORM.moduleName("./dealDashboard/dealDashboard"),
        nav: false,
        name: "dealDashboard",
        route: "/deal/:id",
        title: "DEAL Dashboard",
      },
      {
        moduleId: PLATFORM.moduleName("./funding/funding"),
        nav: false,
        name: "funding",
        route: "/funding/:id",
        title: "Funding",
      },
      {
        moduleId: PLATFORM.moduleName("./comingSoon/comingSoon"),
        nav: false,
        name: "comingSoon",
        route: ["comingSoon"],
        title: "Coming Soon!",
      },
      {
        moduleId: PLATFORM.moduleName("./playground/playground"),
        nav: false,
        name: "playground",
        route: ["playground"],
        title: "Playground",
      },
      {
        route: "playground/*componentName", moduleId: PLATFORM.moduleName("./playground/playgroundWelcome/playgroundWelcome"),
      },
      {
        moduleId: PLATFORM.moduleName("./resources/elements/primeDesignSystem/demos/demos"),
        nav: false,
        name: "storybook",
        route: ["storybook"],
        title: "Storybook",
      },
    ]);

    config.fallbackRoute("home");

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    /**
     * obtain and store the scroll position per each page as we leave
     */
    config.addPreActivateStep({
      run(navigationInstruction: NavigationInstruction, next: Next) {
        if (navigationInstruction.previousInstruction) {
          let position = _this.storageService.ssGet(_this.getScrollStateKey(navigationInstruction.previousInstruction.fragment));
          if (!position) {
            position = `${window.scrollX},${window.scrollY}`;
            _this.storageService.ssSet(_this.getScrollStateKey(navigationInstruction.previousInstruction.fragment), position);
          }
        }
        return next();
      },
    });

    /**
     * restore the scroll position per each page as we arrive
     */
    config.addPostRenderStep({
      run(navigationInstruction: NavigationInstruction, next: Next) {
        const hashid = document.location.hash?.replace("#", "");
        if (hashid){
          Utils.waitUntilTrue(() => document.getElementById(hashid) !== null || document.getElementsByName(hashid).length > 0, 5000).then(() => {
            const elem = document.getElementById(hashid);
            if (elem){
              //the hashid is referring to an element with an id
              elem.scrollIntoView();
            } else {
              const elems = document.getElementsByName(hashid);
              if (elems.length > 0){
                //the hashid is referring to an element with a name
                elems[0].scrollIntoView();
              }
            }
          });
        } else {
          let position = _this.storageService.ssGet(_this.getScrollStateKey(navigationInstruction.fragment));
          if (!position) {
            position = "0,0";
          }
          const scrollArgs = position.split(",");
          setTimeout(() => window.scrollTo(Number(scrollArgs[0]), Number(scrollArgs[1])), 100);
        }
        return next();
      },
    });

    this.router = router;
  }
  /**
   * store the scroll position per each page
   */
  handleScrollEvent(): void {
    this.storageService.ssSet(this.getScrollStateKey(this.router.currentInstruction.fragment),
      `${window.scrollX},${window.scrollY}`);
  }

  getScrollStateKey(fragment: string): string {
    switch (fragment) {
      case "":
      case "/":
      case "/home":
        return "scroll-/home";
      default:
        return `scroll-${fragment}`;
    }
  }

  onNavigate(): void {
    this.showingMobileMenu = false;
  }

  toggleMobileMenu(): void {
    this.showingMobileMenu = !this.showingMobileMenu;
  }

  navigate(href: string): void {
    this.onNavigate();
    this.router.navigate(href);
  }

  handleShowWalletMenu(): void {
    this.showingWalletMenu = true;
  }
}
