import { Web3Provider } from "@ethersproject/providers";
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */
import { ethers, Signer } from "ethers";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { DisclaimerService } from "services/DisclaimerService";
import { EthereumService } from "./EthereumService";
import { ConsoleLogService } from "./ConsoleLogService";
import { BrowserStorageService } from "./BrowserStorageService";
import { E2E_ADDRESSES_PRIVATE_KEYS } from "./../../cypress/fixtures/dealFixtures";

@autoinject
// @ts-ignore
export class EthereumServiceTesting extends EthereumService {

  public testing_signer;

  constructor(
    eventAggregator: EventAggregator,
    disclaimerService: DisclaimerService,
    consoleLogService: ConsoleLogService,
    storageService: BrowserStorageService,
  ) {
    super( eventAggregator, disclaimerService, consoleLogService, storageService);
  }

  // /**
  //  * We are relying on a provider being a signer.
  //  * We are creating a provider from web3ModalProvider which is a signer, therefore walletProvider is a signer
  //  *   - web3ModalProvider is provider AND a signer
  //  *   - We want that!
  //  */

  // public initialize(network: AllowedNetworks): void {
  //   super.initialize(network);

  //   this.testing_signer =
  //     new ethers.Wallet(E2E_ADDRESSES_PRIVATE_KEYS[this.defaultAccountAddress], this.readOnlyProvider);
  // }

  // private async fireAccountsChangedHandler(account: Address) {
  //   console.info(`account changed: ${account}`);

  //   if (account !== null) {
  //     account = localStorage.getItem("PRIME_E2E_ADDRESS");
  //   }
  //   this.eventAggregator.publish("Network.Changed.Account", account);
  // }

  private async connect(): Promise<void> {
    if (!this.walletProvider) {
      // @ts-ignore
      this.setProvider(new ethers.providers.JsonRpcProvider(EthereumService.ProviderEndpoints[EthereumService.targetedNetwork]));
    }
  }

  private async getCurrentAccountFromProvider(_provider: Web3Provider): Promise<Signer | string> {
    const address = "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498";
    return address;
  }

  public getDefaultSigner(): Signer {
    const address = "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498";

    const mockedProvideXYZ = new ethers.providers.JsonRpcProvider(EthereumService.ProviderEndpoints[EthereumService.targetedNetwork]);

    if (!this.testing_signer) {
      this.testing_signer =
        new ethers.Wallet(E2E_ADDRESSES_PRIVATE_KEYS[address], mockedProvideXYZ);
    }
    return this.testing_signer;

    /**
     * Problem with readonlyProvider is that it can't seem to sign things.
     * Other code worked, because it supports that
     * but the jsonRpcProvider, we break ^ stuff, but we can expect to sign stuff
     */

    // const signer = this.walletProvider.getSigner(this.defaultAccountAddress);
    // signer.signMessage = (message: string) => {
    //   const wallet = new ethers.Wallet(E2E_ADDRESSES_PRIVATE_KEYS[this.defaultAccountAddress]);
    //   return wallet.signMessage(message);
    // };
    // return signer;
  }

  // private async connect(): Promise<void> {
  //   /**
  //    * Difference to normal EthereumService: Only open Disclaimer, when clicking on "Connect to a Wallet" button.
  //    *   In E2e tests, the disclaimer modal popped up on first load, because localStorage is always cleared.
  //    */
  //   let account = localStorage.getItem("PRIME_E2E_ADDRESS");
  //   if (account && !(await this.disclaimerService.ensurePrimeDisclaimed(account))) {
  //     this.disconnect({ code: -1, message: "User declined the Prime Deals disclaimer" });
  //     account = null;
  //   }

  //   if (account !== null) {
  //     this.setProvider();
  //   }
  // }

  // /**
  //  * silently connect to metamask if a metamask account is already connected,
  //  * without invoking Web3Modal nor MetaMask popups.
  //  */
  // public async connectToConnectedProvider(): Promise<void> {
  //   /* prettier-ignore */ console.log(">>>> 0 >>>> TCL ~ file: EthereumServiceTesting.ts ~ line 86 ~ EthereumServiceTesting ~ connectToConnectedProvider ~ connectToConnectedProvider");
  //   this.setProvider();
  // }

  // private async setProvider(): Promise<void> {
  //   let address = localStorage.getItem("PRIME_E2E_ADDRESS");
  //   if (address === "null") {
  //     address = null;
  //   } else if (address === "undefined") {
  //     address = undefined;
  //   }

  //   if (address === null || address === undefined) return;

  //   this.defaultAccountAddress = address;

  // this.walletProvider =
  //   (new ethers.Wallet(E2E_ADDRESSES_PRIVATE_KEYS[this.defaultAccountAddress], this.readOnlyProvider)).provider as Web3Provider;

  // // @ts-ignore
  // const network = await super.getNetwork(this.walletProvider);
  // if (network.name !== EthereumService.targetedNetwork) {
  //   return;
  // }

  //   this.walletProvider.lookupAddress = () => Promise.resolve("");
  //   // @ts-ignore  @ethersproject/contracts/src.ts/index.ts -> line 411 -> `if (!contract.signer) {` needed
  //   this.walletProvider.signer = this.walletProvider.getSigner();

  //   /* prettier-ignore */ console.log("TCL ~ file: EthereumServiceTesting.ts ~ line 186 ~ EthereumServiceTesting ~ this.defaultAccountAddress", this.defaultAccountAddress);
  //   // @ts-ignore
  //   super.fireConnectHandler({ chainId: network.chainId, chainName: network.name, provider: this.walletProvider });
  //   this.fireAccountsChangedHandler(address);

  //   /**
  //    * Simulate account changed from Metamask
  //       this.web3ModalProvider.on("accountsChanged", this.handleAccountsChanged);
  //    */
  //   this.eventAggregator.subscribe("accountsChanged", (account) => {
  //     this.defaultAccountAddress = account;
  //     this.fireAccountsChangedHandler(account);
  //   });
  // }
}
