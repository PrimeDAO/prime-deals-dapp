/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { ConsoleLogService } from "services/ConsoleLogService";
import { BigNumber, BigNumberish, ethers, Signer } from "ethers";
import {
  BaseProvider,
  ExternalProvider,
  Web3Provider,
  Network,
} from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";
import { EventAggregator } from "aurelia-event-aggregator";
import { autoinject } from "aurelia-framework";
import { formatUnits, getAddress, parseUnits } from "ethers/lib/utils";
import { DisclaimerService } from "services/DisclaimerService";
import { Utils } from "services/utils";
import { EthereumService } from "./EthereumService";

/* eslint-disable @typescript-eslint/no-empty-function */
interface IEIP1193 {
  on(eventName: "accountsChanged", handler: (accounts: Array<Address>) => void);
  on(eventName: "chainChanged", handler: (chainId: number) => void);
  on(eventName: "connect", handler: (info: { chainId: number }) => void);
  on(
    eventName: "disconnect",
    handler: (error: { code: number; message: string }) => void
  );
}

export type Address = string;
export type Hash = string;

export interface IBlockInfoNative {
  hash: Hash;
  /**
   * previous block
   */
  parentHash: Hash;
  /**
   *The height(number) of this
   */
  number: number;
  timestamp: number;
  /**
   * The maximum amount of gas that this block was permitted to use. This is a value that can be voted up or voted down by miners and is used to automatically adjust the bandwidth requirements of the network.
   */
  gasLimit: BigNumber;
  /**
   * The total amount of gas used by all transactions in this
   */
  gasUsed: BigNumber;
  transactions: Array<Hash>;
}

export interface IBlockInfo extends IBlockInfoNative {
  blockDate: Date;
}

export type AllowedNetworks = "mainnet" | "kovan" | "rinkeby";

export enum Networks {
  Mainnet = "mainnet",
  Rinkeby = "rinkeby",
  Kovan = "kovan",
}

export interface IChainEventInfo {
  chainId: number;
  chainName: AllowedNetworks;
  provider: Web3Provider;
}

interface IIEthereumService {
  /**
   * provided by ethers
   */
  readOnlyProvider: BaseProvider;

  initialize(network: AllowedNetworks): void;

  getDefaultSigner(): Signer;

  /**
   * provided by ethers given provider from Web3Modal
   */
  walletProvider: Web3Provider;
  defaultAccountAddress: Address;

  ensureConnected(): boolean;

  /**
   * silently connect to metamask if a metamask account is already connected,
   * without invoking Web3Modal nor MetaMask popups.
   */
  connectToConnectedProvider(): Promise<void>;

  disconnect(error: { code: number; message: string }): void;

  /**
   *
   * @param provider should be a Web3Provider
   * @returns
   */
  switchToTargetedNetwork(provider: ExternalProvider): Promise<boolean>;

  addTokenToMetamask(
    tokenAddress: Address,
    tokenSymbol: string,
    tokenDecimals: number,
    tokenImage: string
  ): Promise<boolean>;

  getMetamaskHasToken(tokenAddress: Address): boolean;

  lastBlock: IBlockInfo;

  /**
   * so unit tests will be able to complete
   */
  dispose(): void;

  getEtherscanLink(addressOrHash: Address | Hash, tx?: boolean): string;
}

export abstract class IEthereumService implements IIEthereumService {
  readOnlyProvider: ethers.providers.BaseProvider;
  initialize(network: AllowedNetworks): void {
    console.log("TCL ~ file: IEthereumService.ts ~ line 129 ~ IEthereumService ~ initialize ~ initialize");
    throw new Error("Method not implemented.");
  }
  getDefaultSigner(): ethers.Signer {
    throw new Error("Method not implemented.");
  }
  walletProvider: ethers.providers.Web3Provider;
  defaultAccountAddress: string;
  ensureConnected(): boolean {
    throw new Error("Method not implemented.");
  }
  connectToConnectedProvider(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  disconnect(error: { code: number; message: string; }): void {
    throw new Error("Method not implemented.");
  }
  switchToTargetedNetwork(provider: ethers.providers.ExternalProvider): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  addTokenToMetamask(tokenAddress: string, tokenSymbol: string, tokenDecimals: number, tokenImage: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  getMetamaskHasToken(tokenAddress: string): boolean {
    throw new Error("Method not implemented.");
  }
  lastBlock: IBlockInfo;
  dispose(): void {
    throw new Error("Method not implemented.");
  }
  getEtherscanLink(addressOrHash: string, tx?: boolean): string {
    throw new Error("Method not implemented.");
  }
}
