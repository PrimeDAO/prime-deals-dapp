import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I'm in the mobile view", () => {
  cy.viewport("iphone-8");
});
