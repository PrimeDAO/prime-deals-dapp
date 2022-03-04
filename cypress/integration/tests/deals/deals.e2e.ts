
import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to the All Deals page", () => {
  cy.get("[data-test='all-deals-button']").click();
  cy.url().should("include", "initiate");
});

Given("I choose Deal Type", () => {
  cy.get("[data-test='initiate-deal-button']").click();
  cy.url().should("include", "initiate");

  cy.contains("div", "Choose Deal Type").should("be.visible");
});

Given("I Open Proposals", () => {
  cy.contains("li", "Open Proposals").click();
  cy.url().should("include", "deals/open");
});

Given("I want to see Running Deals", () => {
  cy.contains("li", "Running Deals").click();
  cy.url().should("include", "deals/running");
});

Then("I can read about the deal types", () => {})

