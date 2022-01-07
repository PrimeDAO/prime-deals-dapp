
import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to the Deals home page", () => {
  cy.visit("/");
});

Given("I navigate to the All Deals page", () => {
  cy.get("[data-test='all-deals-button']").click();
  cy.url().should("include", "initiate");
});
