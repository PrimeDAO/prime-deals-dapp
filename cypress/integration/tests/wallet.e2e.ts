import "reflect-metadata";
import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";
import { CONNECTED_PUBLIC_USER_ADDESS, proposalLeadAddress1 } from "../../fixtures/dealFixtures";
import { Utils } from "../../../src/services/utils";

export class E2eWallet {
  public static _currentWalletAddress = "";
  public static get currentWalletAddress() {
    if (this._currentWalletAddress === "") {
      const errorMessage = "[Test] Wallet address expected. Please use a step, that specifies an address.\n\n" +
        "Quickest way to fix this, is to set:\n" +
        "E2eWallet.currentWalletAddress = <myAddress>.\n\n" +
        "If you wanted to test the \"Anonymous User case\", then test code likely has a bug.";
      throw new Error(errorMessage);
    }

    return this._currentWalletAddress;
  }
  public static set currentWalletAddress(newAddress) {
    this._currentWalletAddress = newAddress;
  }

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

    cy.get("[data-test='connectButton']").then(connectButton => {
      // 1. Check if already connected
      const text = connectButton.text().trim();
      if (text !== "Connect to a Wallet") {
        return;
      }

      // 2. If not, connect
      cy.contains("button", "Connect to a Wallet").click();

      cy.get("ux-dialog-container").within(() => {
        cy.get(".dialogFooter .pToggle").click();
        cy.contains("button", "Accept").click();
      });

      cy.get(".navbar-container").within(() => {
        cy.get(".connectButton .address").should("be.visible");
      });

      // cy.get("[data-test='modelContent']").should("be.visible");
      // cy.get("[data-test='modelContent']").should("not.be.visible");
    });
  }
}

Given("I'm a Connected Public user", () => {
  E2eNavbar.connectToWallet(CONNECTED_PUBLIC_USER_ADDESS);
});

Given("I connect to the wallet with address {string}", (address: string) => {
  E2eNavbar.connectToWallet(address);
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

Given("I'm a Public viewer", () => {
  E2eNavbar.getConnectWalletButton().should("be.visible");
  E2eNavbar.getUserAddress().should("not.exist");
});
