import { Given, Then, When, And } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to the initiate a deal page", () => {
  cy.get("[data-test='initiate-deal-button']").click();
  cy.url().should("match", /(initiate$)/)
});

Then("I can see Token Swap deal type", () => {
  cy.contains("div.title", "Token Swap").should("be.visible")
})

And("I can see Co-liquidity deal type", () => {
  cy.contains("[data-test='initiate-deal-type-title']", "Co-liquidity").should("be.visible")
})

When("I select Token Swap", () => {
  cy.get("[data-test='button-initiate/token-swap']").click()
});

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

And('I select Partnered Deal', () => {
  cy.get("[data-test='button-initiate/token-swap/partnered-deal/proposal']").click()
})

Then("I can view the Partnered Deal wizard", () => {
  cy.url().should("include", "initiate/token-swap/partnered-deal/proposal")
})
