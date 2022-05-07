import { And, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to the initiate a deal page", () => {
  cy.get("[data-test='initiate-deal-button']").click();
  cy.url().should("match", /(initiate$)/);
});

Then("I can see Token Swap deal type", () => {
  cy.contains("div.title", "Token Swap").should("be.visible");
});

And("I can see Joint venture deal type", () => {
  cy.contains("[data-test='initiate-deal-type-title']", "Joint venture").should("be.visible");
});

When("I select Token Swap", () => {
  cy.get("[data-test='button-token-swap']").click();
});

Then("I can see Open Proposal and Partnered Deal", () => {
  cy.contains("[data-test='initiate-deal-type-title']", "Open Proposal").should("be.visible");
  cy.contains("[data-test='initiate-deal-type-title']", "Partnered Deal").should("be.visible");
});

And("I select Open Proposal", () => {
  cy.get("[data-test='open-proposal-button']").click();
});

Then("I can view the Open Proposal wizard", () => {
  cy.url().should("include", "initiate/token-swap/open-proposal/proposal");
});

And("I select Partnered Deal", () => {
  cy.get("[data-test='partnered-deal-button']").click();
});

Then("I can view the Partnered Deal wizard", () => {
  cy.url().should("include", "initiate/token-swap/partnered-deal/proposal");
});
