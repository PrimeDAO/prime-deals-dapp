import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I choose Deal Type", () => {
  cy.get("[data-test='initiate-deal-button']").click();
  cy.url().should("include", "initiate");

  cy.contains("div", "Choose Deal Type").should("be.visible");
});

