/* eslint-disable @typescript-eslint/no-empty-function */
const ADDRESS = "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498";

/* eslint-disable no-console */
import { ethers, Signer } from "ethers";
import { BaseProvider, Web3Provider } from "@ethersproject/providers";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { DisclaimerService } from "services/DisclaimerService";
import { Address, AllowedNetworks, EthereumService, Hash, IBlockInfo, Networks } from "./EthereumService";

@autoinject
export class EthereumServiceTesting {
  constructor(
    private eventAggregator: EventAggregator,
    private disclaimerService: DisclaimerService,
  ) { }

  public static ProviderEndpoints = {
    "mainnet": `https://${process.env.RIVET_ID}.eth.rpc.rivet.cloud/`,
    "rinkeby": `https://${process.env.RIVET_ID}.rinkeby.rpc.rivet.cloud/`,
    "kovan": `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
  };

  public static targetedNetwork: AllowedNetworks;
  public static targetedChainId: number;

  /**
   * provided by ethers
   */
  public readOnlyProvider: BaseProvider;

  public initialize(network: AllowedNetworks): void {

    if (!network) {
      throw new Error("Ethereum.initialize: `network` must be specified");
    }

    EthereumService.targetedNetwork = network;
    EthereumService.targetedChainId = this.chainIdByName.get(network);
    // EthereumService.providerOptions.torus.options.network = network;

    const readonlyEndPoint = EthereumService.ProviderEndpoints[EthereumService.targetedNetwork];
    if (!readonlyEndPoint) {
      throw new Error(`Please connect to either ${Networks.Mainnet} or ${Networks.Rinkeby}`);
    }

    // comment out to run DISCONNECTED
    this.readOnlyProvider = ethers.getDefaultProvider(EthereumService.ProviderEndpoints[EthereumService.targetedNetwork]);
    this.readOnlyProvider.pollingInterval = 15000;
  }

  private chainIdByName = new Map<AllowedNetworks, number>([
    [Networks.Mainnet, 1],
    [Networks.Rinkeby, 4],
    [Networks.Kovan, 42],
  ]);

  private async fireAccountsChangedHandler(account: Address) {
    if (account && !(await this.disclaimerService.ensurePrimeDisclaimed(account))) {
      this.disconnect({ code: -1, message: "User declined the Prime Deals disclaimer" });
      account = null;
    }
    console.info(`account changed: ${account}`);
    this.eventAggregator.publish("Network.Changed.Account", ADDRESS);
  }
  private fireDisconnectHandler(error: { code: number; message: string }) {
    console.info(`disconnected: ${error?.code}: ${error?.message}`);
    this.eventAggregator.publish("Network.Changed.Disconnect", error);
  }

  public getDefaultSigner(): Signer {
    return this.walletProvider.getSigner(this.defaultAccountAddress);
  }

  /**
   * provided by ethers given provider from Web3Modal
   */
  public walletProvider: Web3Provider;
  public defaultAccountAddress: Address;

  private async connect(): Promise<void> {
    if (!this.walletProvider) {
      this.setProvider();
    }
  }

  public ensureConnected(): boolean {
    if (!this.defaultAccountAddress) {
      // TODO: make this await until we're either connected or not?
      this.connect();
      return false;
    }
    else {
      return true;
    }
  }

  /**
   * silently connect to metamask if a metamask account is already connected,
   * without invoking Web3Modal nor MetaMask popups.
   */
  public async connectToConnectedProvider(): Promise<void> {
    this.setProvider();
  }

  private async setProvider(): Promise<void> {
    this.defaultAccountAddress = ADDRESS;
    this.fireAccountsChangedHandler(ADDRESS);

    return;
  }

  public disconnect(error: { code: number; message: string }): void {
    this.defaultAccountAddress = undefined;
    this.fireAccountsChangedHandler(null);
    this.walletProvider = undefined;
    this.fireDisconnectHandler(error);
  }

  /**
   *
   * @param provider should be a Web3Provider
   * @returns
   */
  public async switchToTargetedNetwork(): Promise<boolean> {
    return false;
  }

  public async addTokenToMetamask(
    _tokenAddress: Address,
    _tokenSymbol: string,
    _tokenDecimals: number,
    _tokenImage: string,
  ): Promise<boolean> {
    return Promise.resolve(false);
  }

  public getMetamaskHasToken(_tokenAddress: Address): boolean {
    return false;
  }

  public lastBlock: IBlockInfo;

  /**
   * so unit tests will be able to complete
   */
  public dispose(): void {}

  public getEtherscanLink(addressOrHash: Address | Hash, tx = false): string {
    let targetedNetwork = EthereumService.targetedNetwork as string;
    if (targetedNetwork === Networks.Mainnet) {
      targetedNetwork = "";
    } else {
      targetedNetwork = targetedNetwork + ".";
    }

    return `http://${targetedNetwork}etherscan.io/${tx ? "tx" : "address"}/${addressOrHash}`;
  }
}

// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-console */
// import { ConsoleLogService } from "services/ConsoleLogService";
// import { BigNumber, BigNumberish, ethers, Signer } from "ethers";
// import {
//   BaseProvider,
//   ExternalProvider,
//   Web3Provider,
//   Network,
// } from "@ethersproject/providers";
// import Web3Modal from "web3modal";
// import WalletConnectProvider from "@walletconnect/web3-provider";
// import Torus from "@toruslabs/torus-embed";
// import { EventAggregator } from "aurelia-event-aggregator";
// import { autoinject } from "aurelia-framework";
// import { formatUnits, getAddress, parseUnits } from "ethers/lib/utils";
// import { DisclaimerService } from "services/DisclaimerService";
// import { Utils } from "services/utils";
// import { EthereumService } from "./EthereumService";
// import { BrowserStorageService } from "./BrowserStorageService";

// const ADDRESS = "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498";

// /* eslint-disable @typescript-eslint/no-empty-function */
// interface IEIP1193 {
//   on(eventName: "accountsChanged", handler: (accounts: Array<Address>) => void);
//   on(eventName: "chainChanged", handler: (chainId: number) => void);
//   on(eventName: "connect", handler: (info: { chainId: number }) => void);
//   on(
//     eventName: "disconnect",
//     handler: (error: { code: number; message: string }) => void
//   );
// }

// export type Address = string;
// export type Hash = string;

// export interface IBlockInfoNative {
//   hash: Hash;
//   /**
//    * previous block
//    */
//   parentHash: Hash;
//   /**
//    *The height(number) of this
//    */
//   number: number;
//   timestamp: number;
//   /**
//    * The maximum amount of gas that this block was permitted to use. This is a value that can be voted up or voted down by miners and is used to automatically adjust the bandwidth requirements of the network.
//    */
//   gasLimit: BigNumber;
//   /**
//    * The total amount of gas used by all transactions in this
//    */
//   gasUsed: BigNumber;
//   transactions: Array<Hash>;
// }

// export interface IBlockInfo extends IBlockInfoNative {
//   blockDate: Date;
// }

// export type AllowedNetworks = "mainnet" | "kovan" | "rinkeby";

// export enum Networks {
//   Mainnet = "mainnet",
//   Rinkeby = "rinkeby",
//   Kovan = "kovan",
// }

// export interface IChainEventInfo {
//   chainId: number;
//   chainName: AllowedNetworks;
//   provider: Web3Provider;
// }

// @autoinject
// export class EthereumServiceTesting {
//   constructor(
//     private eventAggregator: EventAggregator,
//     private disclaimerService: DisclaimerService,
//     private consoleLogService: ConsoleLogService,
//     private storageService: BrowserStorageService,
//   ) { }

//   readOnlyProvider: ethers.providers.BaseProvider;
//   initialize(network: AllowedNetworks): void {
//     console.log("TCL ~ file: IEthereumService.ts ~ line 129 ~ IEthereumService ~ initialize ~ initialize");
//     EthereumService.targetedNetwork = network;
//   }
//   getDefaultSigner(): ethers.Signer {
//     return;
//   }
//   walletProvider: ethers.providers.Web3Provider;
//   public defaultAccountAddress: string;

//   private connect() {
//     this.setProvider();
//   }
//   public ensureConnected(): boolean {
//     this.connect();
//     throw new Error("Method not implemented.");
//   }

//   private async setProvider(web3ModalProvider?: Web3Provider & IEIP1193 & ExternalProvider): Promise<void> {
//     this.defaultAccountAddress = ADDRESS;
//     this.fireAccountsChangedHandler(ADDRESS);
//   }
//   private fireAccountsChangedHandler(account: string) {
//     console.info(`account changed: ${account}`);
//     this.eventAggregator.publish("Network.Changed.Account", account);
//   }

//   public async connectToConnectedProvider(): Promise<void> {
//     await this.setProvider();
//   }

//   public disconnect(error: { code: number; message: string; }): void {
//     this.defaultAccountAddress = undefined;
//   }
//   public async switchToTargetedNetwork(provider: ethers.providers.ExternalProvider): Promise<boolean> {
//     await this.setProvider(provider as any);

//     return true;
//   }
//   public addTokenToMetamask(tokenAddress: string, tokenSymbol: string, tokenDecimals: number, tokenImage: string): Promise<boolean> {
//     return Promise.resolve(true);
//   }
//   public getMetamaskHasToken(tokenAddress: string): boolean {
//     return false;
//   }
//   lastBlock: IBlockInfo;
//   dispose(): void {
//   }
//   getEtherscanLink(addressOrHash: string, tx?: boolean): string {
//     return "eth service mock";
//   }
// }
