import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to a Deal Dashboard", () => {
  cy.visit("/deal/0x0");
});
Given("No thread is created for this deal", () => {
  cy.contains(".header", "Discuss");
  cy.contains("section", "There are no discussions on this deal yet. Click on a deal clause to get started.");
});

Then("I should see a no discussions for deal message", () => {});