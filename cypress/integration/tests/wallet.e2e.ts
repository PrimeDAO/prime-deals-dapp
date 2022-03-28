import "reflect-metadata";
import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";
import { proposalLeadAddress1 } from "../../fixtures/dealFixtures";
import detectEthereumProvider from "@metamask/detect-provider";
import { BrowserStorageService } from "../../../src/services/BrowserStorageService";
/* eslint-disable no-console */
import { ConsoleLogService } from "../../../src/services/ConsoleLogService";
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
import { Utils } from "../../../src/services/utils";
// import { EthereumService } from "../../../src/services/EthereumService";
// import { EthereumServiceTesting } from "../../../src/services/EthereumServiceTesting";

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Cypress {
    aurelia: any;
  }
}

export class E2eWallet {
  public static currentWalletAddress = "";

  public static getSmallHexAddress() {
    return Utils.smallHexString(E2eWallet.currentWalletAddress);
  }
}

export class E2eNavbar {
  public static getConnectWalletButton() {
    return cy.contains("navbar button", "Connect to a Wallet");
  }

  public static getUserAddress() {
    return cy.get("[data-test='connect-button'] usersaddress");
  }

  public static connectToWallet(address: string = proposalLeadAddress1) {
    localStorage.setItem("PRIME_E2E_ADDRESS", address);
    E2eWallet.currentWalletAddress = address;

    cy.contains("button", "Connect to a Wallet").click();

    cy.get("ux-dialog-container").within(() => {
      cy.get(".dialogFooter .pToggle").click();
      cy.contains("button", "Accept").click();
    });

    cy.get(".navbar-container").within(() => {
      cy.get(".connectButton .address").should("be.visible");
    });
  }
}

Given("I connect to the wallet with address {string}", (address: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  // @ts-ignore
  // Cypress.aurelia.use.singleton(EthereumService, "EthereumServiceTesting");
  // @ts-ignore
  console.log( "TCL ~ file: wallet.e2e.ts ~ line 54 ~ Given ~ Cypress.aurelia", Cypress.aurelia);
  const test = Signer.isSigner("value");

  localStorage.setItem("PRIME_E2E_ADDRESS", address);
  E2eWallet.currentWalletAddress = address;

  cy.contains("button", "Connect to a Wallet").click();

  cy.get("ux-dialog-container").within(() => {
    cy.get(".dialogFooter .pToggle").click();
    cy.contains("button", "Accept").click();
  });

  cy.get(".navbar-container").within(() => {
    cy.get(".connectButton .address").should("be.visible");
  });
});

Given("I'm a Public viewer", () => {
  E2eNavbar.getConnectWalletButton().should("be.visible");
  E2eNavbar.getUserAddress().should("not.exist");
});

Given("I'm connected to my wallet", () => {
  E2eNavbar.connectToWallet(E2eWallet.currentWalletAddress);
});

Given("I'm not connected to a wallet", () => {
  E2eNavbar.getConnectWalletButton().should("be.visible");
  E2eNavbar.getUserAddress().should("not.exist");
});
