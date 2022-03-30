import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("No thread is created for this deal", () => {
  cy.contains("discussions-list", "Discuss").should("be.visible");
  cy.contains("section", "None of the clauses are currently being discussed.").should("be.visible");
});

Then("I should see a no discussions for deal message", () => {
  cy.log("todo");
});
