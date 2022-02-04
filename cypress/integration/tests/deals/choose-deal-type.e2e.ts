import { Given, Then, When, And } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to the initiate a deal page", () => {
  cy.get("[data-test='initiate-deal-button']").click();
  cy.url().should("include", "initiate");
});

Then("I can see Token Swap deal type", () => {
  cy.contains("div.title", "Token Swap").should("be.visible")
})

And("I can see Joint Venture deal type", () => {
  cy.contains("[data-test='initiate-deal-type-title']", "Joint Venture").should("be.visible")
})

When("I select Token Swap", () => {
  cy.get("[data-test='button-initiate/token-swap']").click()
});

Then("I am presented the option to choose a partner", () => {
  cy.url().should("include", "token-swap")
})

Then("I can see Open Proposal and Partnered Deal", () => {
  cy.contains("[data-test='initiate-deal-type-title']", "Open Proposal").should("be.visible")
  cy.contains("[data-test='initiate-deal-type-title']", "Partnered Deal").should("be.visible")
})

And('I select Open Proposal', () => {
  cy.get("[data-test='button-initiate/token-swap/open-proposal/proposal']").click()
})

Then("I can view the Open Proposal wizard", () => {
  cy.url().should("include", "initiate/token-swap/open-proposal/proposal")
})
