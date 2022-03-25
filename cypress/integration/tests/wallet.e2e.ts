import "reflect-metadata";
import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";
import { Utils } from "../../../src/services/utils";

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
}

Given("I connect to the wallet with address {string}", (address: string) => {
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

Given("I'm not connected to a wallet", () => {
  E2eNavbar.getConnectWalletButton().should("be.visible");
  E2eNavbar.getUserAddress().should("not.exist");
});
