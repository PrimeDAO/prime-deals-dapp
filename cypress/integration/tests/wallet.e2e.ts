import "reflect-metadata";
import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";
import { proposalLeadAddress1 } from "../../fixtures/dealFixtures";
/* eslint-disable no-console */
import { Utils } from "../../../src/services/utils";

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
  /* prettier-ignore */ console.log("TCL ~ file: wallet.e2e.ts ~ line 54 ~ Given ~ Cypress.aurelia", Cypress.aurelia);
  // @ts-ignore

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
