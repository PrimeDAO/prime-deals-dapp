import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I accept the deal", () => {
  cy.contains("button", "Accept").click();
});
