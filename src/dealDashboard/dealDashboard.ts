import { Router } from "aurelia-router";
import { DisclaimerService } from "../services/DisclaimerService";
import { EthereumService } from "../services/EthereumService";
import { autoinject } from "aurelia-framework";
import { DealService } from "services/DealService";
import { Address } from "services/EthereumService";
import "./dealDashboard.scss";
// import { Deal } from "entities/Deal";
import { EventAggregator } from "aurelia-event-aggregator";
import { BigNumber } from "ethers";
import { NumberService } from "services/NumberService";
import { DisposableCollection } from "services/DisposableCollection";

@autoinject
export class DealDashboard {
  address: Address;

  subscriptions: DisposableCollection = new DisposableCollection();

  // deal: Deal;
  loading = true;
  // dealTokenToReceive = 1;
  fundingTokenToPay: BigNumber;
  dealTokenToReceive: BigNumber;
  progressBar: HTMLElement;
  bar: HTMLElement;

  userFundingTokenBalance: BigNumber;
  userFundingTokenAllowance: BigNumber;

  connected = false;

  constructor(
    private eventAggregator: EventAggregator,
    private dealService: DealService,
    private numberService: NumberService,
    private ethereumService: EthereumService,
    private disclaimerService: DisclaimerService,
    private router: Router,
  ) {
    // this.subscriptions.push(this.eventAggregator.subscribe("Contracts.Changed", async () => {
    //   this.hydrateUserData().then(() => { this.connected = !!this.ethereumService.defaultAccountAddress; });
    // }));
    this.connected = !!this.ethereumService.defaultAccountAddress;
  }

  // @computedFrom("deal.amountRaised", "deal.target")
  // get fractionComplete(): number {

  //   let fraction = 0;
  //   if (this.deal?.target) {
  //     fraction = this.numberService.fromString(fromWei(this.deal.amountRaised)) /
  //       this.numberService.fromString(fromWei(this.deal.target));
  //   }

  //   if (fraction === 0) {
  //     this.progressBar.classList.add("hide");
  //   } else {
  //     this.progressBar.classList.remove("hide");
  //   }
  //   this.bar.style.width = `${Math.min(fraction, 1.0)*100}%`;

  //   return fraction;
  // }

  // @computedFrom("deal.amountRaised")
  // get maxFundable(): BigNumber { return this.deal.cap.sub(this.deal.amountRaised); }

  // @computedFrom("fundingTokenToPay", "deal.fundingTokensPerDealToken")
  // get dealTokenReward(): number {
  //   return (this.deal?.fundingTokensPerDealToken > 0) ?
  //     (this.numberService.fromString(fromWei(this.fundingTokenToPay ?? "0"))) / this.deal?.fundingTokensPerDealToken
  //     : 0;
  // }

  // /** TODO: don't use current balance */
  // @computedFrom("deal.dealRemainder", "deal.dealAmountRequired")
  // get percentDealTokensLeft(): number {
  //   return this.deal?.dealAmountRequired?.gt(0) ?
  //     ((this.numberService.fromString(fromWei(this.deal.dealRemainder)) /
  //       this.numberService.fromString(fromWei(this.deal.dealAmountRequired))) * 100)
  //     : 0;
  // }

  // @computedFrom("userFundingTokenBalance", "fundingTokenToPay")
  // get userCanPay(): boolean { return this.userFundingTokenBalance?.gt(this.fundingTokenToPay ?? "0"); }

  // @computedFrom("maxFundable", "userFundingTokenBalance")
  // get maxUserCanPay(): BigNumber { return this.maxFundable.lt(this.userFundingTokenBalance) ? this.maxFundable : this.userFundingTokenBalance; }

  // @computedFrom("userFundingTokenAllowance", "fundingTokenToPay")
  // get lockRequired(): boolean {
  //   return this.userFundingTokenAllowance?.lt(this.fundingTokenToPay ?? "0") &&
  //     this.maxUserCanPay.gte(this.fundingTokenToPay ?? "0"); }

  // @computedFrom("deal", "ethereumService.defaultAccountAddress")
  // private get dealDisclaimerStatusKey() {
  //   return `deal-disclaimer-${this.deal?.address}-${this.ethereumService.defaultAccountAddress}`;
  // }

  // private get dealDisclaimed(): boolean {
  //   return this.ethereumService.defaultAccountAddress && (localStorage.getItem(this.dealDisclaimerStatusKey) === "true");
  // }

  // public async canActivate(params: { address: Address }): Promise<boolean> {
  //   await this.dealService.ensureInitialized();
  //   const deal = this.dealService.deals?.get(params.address);
  //   await deal.ensureInitialized();
  //   return deal?.canGoToDashboard;
  // }

  // async activate(params: { address: Address}): Promise<void> {
  //   this.address = params.address;
  // }

  // async attached(): Promise<void> {
  //   let waiting = false;

  //   try {
  //     if (this.dealService.initializing) {
  //       await Utils.sleep(200);
  //       this.eventAggregator.publish("deals.loading", true);
  //       waiting = true;
  //       await this.dealService.ensureInitialized();
  //     }
  //     const deal = this.dealService.deals.get(this.address);
  //     if (deal.initializing) {
  //       if (!waiting) {
  //         await Utils.sleep(200);
  //         this.eventAggregator.publish("deals.loading", true);
  //         waiting = true;
  //       }
  //       await deal.ensureInitialized();
  //     }
  //     this.deal = deal;

  //     await this.hydrateUserData();

  //     //this.disclaimDeal();

  //   } catch (ex) {
  //     this.eventAggregator.publish("handleException", new EventConfigException("Sorry, an error occurred", ex));
  //   }
  //   finally {
  //     if (waiting) {
  //       this.eventAggregator.publish("deals.loading", false);
  //     }
  //     this.loading = false;
  //   }
  // }

  // async hydrateUserData(): Promise<void> {
  //   if (this.ethereumService.defaultAccountAddress) {
  //     this.userFundingTokenBalance = await this.deal.fundingTokenContract.balanceOf(this.ethereumService.defaultAccountAddress);
  //     this.userFundingTokenAllowance = await this.deal.fundingTokenAllowance();
  //   }
  // }

  // connect(): void {
  //   this.ethereumService.ensureConnected();
  // }

  // async disclaimDeal(): Promise<boolean> {

  //   let disclaimed = false;

  //   if (!this.deal.metadata.dealDetails.legalDisclaimer || this.dealDisclaimed) {
  //     disclaimed = true;
  //   } else {
  //     // const response = await this.dialogService.disclaimer("https://raw.githubusercontent.com/PrimeDAO/prime-launch-dapp/master/README.md");
  //     const response = await this.disclaimerService.showDisclaimer(
  //       this.deal.metadata.dealDetails.legalDisclaimer,
  //       `${this.deal.metadata.general.projectName} Disclaimer`,
  //     );

  //     if (typeof response.output === "string") {
  //     // then an error occurred
  //       this.eventAggregator.publish("handleFailure", response.output);
  //       disclaimed = false;
  //     } else if (response.wasCancelled) {
  //       disclaimed = false;
  //     } else {
  //       if (response.output) {
  //         localStorage.setItem(this.dealDisclaimerStatusKey, "true");
  //       }
  //       disclaimed = response.output as boolean;
  //     }
  //   }
  //   return disclaimed;
  // }

  // handleMaxBuy() : void {
  //   this.fundingTokenToPay = this.maxUserCanPay;
  // }

  // handleMaxClaim(): void {
  //   this.dealTokenToReceive = this.deal.userClaimableAmount;
  // }

  // async validateClosedOrPaused(): Promise<boolean> {
  //   const closedOrPaused = await this.deal.hydateClosedOrPaused();
  //   if (closedOrPaused) {
  //     this.eventAggregator.publish("handleValidationError", "Sorry, this deal has been closed or paused");
  //     this.router.navigate("/home");
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // async unlockFundingTokens(): Promise<void> {
  //   if (await this.validateClosedOrPaused()) {
  //     return;
  //   }

  //   if (await this.disclaimDeal()) {
  //     this.deal.unlockFundingTokens(this.fundingTokenToPay)
  //       .then((receipt) => {
  //         if (receipt) {
  //           this.hydrateUserData();
  //         }
  //       });
  //   }
  // }

  // async buy(): Promise<void> {
  //   if (await this.validateClosedOrPaused()) {
  //     return;
  //   }

  //   if (!this.fundingTokenToPay?.gt(0)) {
  //     this.eventAggregator.publish("handleValidationError", `Please enter the amount of ${this.deal.fundingTokenInfo.symbol} you wish to contribute`);
  //   } else if (this.userFundingTokenBalance.lt(this.fundingTokenToPay)) {
  //     this.eventAggregator.publish("handleValidationError", `Your ${this.deal.fundingTokenInfo.symbol} balance is insufficient to cover what you want to pay`);
  //   } else if (this.fundingTokenToPay.add(this.deal.amountRaised).gt(this.deal.cap)) {
  //     this.eventAggregator.publish("handleValidationError", `The amount of ${this.deal.fundingTokenInfo.symbol} you wish to contribute will cause the funding maximum to be exceeded`);
  //   } else if (this.lockRequired) {
  //     this.eventAggregator.publish("handleValidationError", `Please click UNLOCK to approve the transfer of your ${this.deal.fundingTokenInfo.symbol} to the Deal contract`);
  //   } else if (await this.disclaimDeal()) {
  //     this.deal.buy(this.fundingTokenToPay)
  //       .then((receipt) => {
  //         if (receipt) {
  //           this.hydrateUserData();
  //         }
  //       });
  //   }
  // }

  // async claim(): Promise<void> {
  //   if (await this.validateClosedOrPaused()) {
  //     return;
  //   }

  //   if (this.deal.claimingIsOpen && this.deal.userCanClaim) {
  //     if (!this.dealTokenToReceive?.gt(0)) {
  //       this.eventAggregator.publish("handleValidationError", `Please enter the amount of ${this.deal.dealTokenInfo.symbol} you wish to receive`);
  //     } else if (this.deal.userClaimableAmount.lt(this.dealTokenToReceive)) {
  //       this.eventAggregator.publish("handleValidationError", `The amount of ${this.deal.dealTokenInfo.symbol} you are requesting exceeds your claimable amount`);
  //     } else {
  //       this.deal.claim(this.dealTokenToReceive);
  //     }
  //   }
  // }

  // async retrieve(): Promise<void> {
  //   if (await this.validateClosedOrPaused()) {
  //     return;
  //   }

  //   if (this.deal.userCanRetrieve) {
  //     this.deal.retrieveFundingTokens()
  //       .then((receipt) => {
  //         if (receipt) {
  //           this.hydrateUserData();
  //         }
  //       });
  //   }
  // }
}
