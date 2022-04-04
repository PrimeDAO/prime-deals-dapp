import "reflect-metadata";
import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";
import { E2E_ADDRESSES } from "../../fixtures/dealFixtures";
import { Utils } from "../../../src/services/utils";
import { E2eNavigation } from "../common/navigate";

const UserTypes = ["Anonymous", "Connected Public"] as const;
export type UserType = typeof UserTypes[number]

export class E2eWallet {
  private static _currentWalletAddress = "";
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

  public static isLead = true;

  public static getSmallHexAddress() {
    return Utils.smallHexString(E2eWallet.currentWalletAddress);
  }
}

export class E2eNavbar {
  public static getConnectWalletButton() {
    return cy.contains("navbar button", "Connect to a Wallet");
  }

  public static getUserAddress() {
    return cy.get("[data-test='connect-button-container'] usersaddress");
  }

  public static connectToWallet(address: string = E2E_ADDRESSES.ProposalLead) {
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

  public static disconnectWallet() {
    cy.get("[data-test='connectButton']").click();
    cy.get("[data-test='diconnect-button']").click();
    this.getConnectWalletButton().should("be.visible");
  }
}

Given("I connect to the wallet with address {string}", (address: string) => {
  E2eNavbar.connectToWallet(address);
});

Given("I'm a Connected Public user", () => {
  givenImAConnectedPublicUser();
});

Given(/^I'm an? "(.*)" user$/, (userType: UserType) => {
  switch (userType) {
    case "Anonymous": {
      givenImAnAnonymousUser();
      break;
    }
    case "Connected Public": {
      givenImAConnectedPublicUser();
      break;
    }
    default: {
      throw new Error("[TEST] No such user type. Available: " + UserTypes.join(", "));
    }
  }
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

Given("I'm not connected to a wallet", () => {
  E2eNavbar.getConnectWalletButton().should("be.visible");
  E2eNavbar.getUserAddress().should("not.exist");
});

function givenImAnAnonymousUser() {
  E2eNavigation.hasAppLoaded().then(hasLoaded => {
    E2eWallet.currentWalletAddress = undefined;
    E2eWallet.isLead = false;

    if (hasLoaded) {
      E2eNavbar.getConnectWalletButton().should("be.visible");
      E2eNavbar.getUserAddress().should("not.exist");
    }
  });
}

function givenImAConnectedPublicUser() {
  E2eNavigation.hasAppLoaded().then(hasLoaded => {
    E2eWallet.currentWalletAddress = E2E_ADDRESSES.ProposalLead;
    E2eWallet.isLead = false;

    if (hasLoaded) {
      // If app loaded, then try to connect
      cy.get("[data-test='connectButton']").then(connectButton => {
        const isConnected = connectButton.text().trim() !== "Connect to a Wallet";
        if (isConnected) {
          E2eNavbar.disconnectWallet();
        } else {
          E2eNavbar.connectToWallet(E2eWallet.currentWalletAddress);
        }
      });
    }
  });
}
