import { Given, Then, When, And } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to the initiate a deal page by clicking Initiate a Deal", () => {
  cy.get("[data-test='initiate-deal-button']").click();
  cy.url().should("include", "initiate");
});

Then("I can see Token Swap deal type", () => {
  cy.contains("div.title", "Token Swap").should("be.visible")
})

And("I can see Joint Venture deal type", () => {
  cy.contains("[data-test='initiate-deal-type-title']", "Joint Venture").should("be.visible")
})

When("I click select on Token Swap card", () => {
  cy.get("[data-test='button-initiate/token-swap']").click()
});

Then("I am redirected to Do you have a partner page", () => {
  cy.url().should("include", "token-swap")
})

Then("I can see Open Proposal and Partnered Deal", () => {
  cy.contains("[data-test='initiate-deal-type-title']", "Open Proposal").should("be.visible")
  cy.contains("[data-test='initiate-deal-type-title']", "Partnered Deal").should("be.visible")
})

And('I click select Open Proposal', () => {
  cy.get("[data-test='button-initiate/token-swap/open-proposal/stage1']").click()
})

Then("I am redirected to Open Proposal wizard", () => {
  cy.url().should("include", "initiate/token-swap/open-proposal/stage1")
})