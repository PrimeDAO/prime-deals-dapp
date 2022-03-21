import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I connect to the wallet with address {string}", (address: string) => {
  localStorage.setItem("PRIME_E2E_ADDRESS", address);
  /* prettier-ignore */ console.log("TCL ~ file: wallet.e2e.ts ~ line 7 ~ Given ~ address", address);
  cy.contains("button", "Connect to a Wallet").click();

  cy.get("ux-dialog-container").within(() => {
    cy.get(".dialogFooter .pToggle").click();
    cy.contains("button", "Accept").click();
  });

  cy.get(".navbar-container").within(() => {
    cy.get(".connectButton .address").should("be.visible");
  });

});
