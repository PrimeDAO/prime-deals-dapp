import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to a Deal Dashboard", () => {
  const dealId = "open_deals_stream_hash_3";
  cy.visit(`/deal/${dealId}`);

  cy.get(".dealDashboardContainer", {timeout: 10000}).should("be.visible");
});
Given("No thread is created for this deal", () => {
  cy.contains("discussions-list", "Discuss").should("be.visible");
  cy.contains("section", "None of the clauses are currently being discussed.").should("be.visible");
});

Then("I should see a no discussions for deal message", () => {
  cy.log("todo");
});
