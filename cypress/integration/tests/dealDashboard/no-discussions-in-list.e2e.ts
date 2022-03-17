import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to a Deal Dashboard", () => {
  const dealId = "open_deals_stream_hash_3";
  cy.visit(`/deal/${dealId}`);
});
Given("No thread is created for this deal", () => {
  cy.contains(".header", "Discuss");
  cy.contains("section", "None of the clauses are currently being discussed.");
});

Then("I should see a no discussions for deal message", () => {
  cy.log("todo");
});
