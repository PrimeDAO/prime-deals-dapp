import { Given, Then, When, And } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to create partnered deal wizard", () => {
  cy.visit("/initiate/token-swap/partnered-deal/proposal");
});

Then("I am presented with Partnered Deal proposal stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/partnered-deal\/proposal$)/)
})

Then("I am presented with Partnered Deal proposal lead stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/partnered-deal\/proposal-lead$)/)
})

Then("I am presented with Partnered Deal primary dao stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/partnered-deal\/primary-dao$)/)
})

Then("I am presented with Partnered Deal partner dao stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/partnered-deal\/partner-dao$)/)
})

Then("I can see stages correct for Partnered Deal", () => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", "Proposal").should("be.visible").within(() => {
      cy.contains("div.value", "1").should('be.visible')
      cy.contains("[data-test='pstepper-step-name']", "Proposal").should('be.visible')
    })
    cy.contains("[data-test='pstepper-step']", "Lead Details").should("be.visible").within(() => {
      cy.contains("div.value", "2").should('be.visible')
      cy.contains("[data-test='pstepper-step-name']", "Lead Details").should('be.visible')
    })
    cy.contains("[data-test='pstepper-step']", "Primary DAO").should("be.visible").within(() => {
      cy.contains("div.value", "3").should('be.visible')
      cy.contains("[data-test='pstepper-step-name']", "Primary DAO").should('be.visible')
    })
    cy.contains("[data-test='pstepper-step']", "Partner DAO").should("be.visible").within(() => {
      cy.contains("div.value", "4").should('be.visible')
      cy.contains("[data-test='pstepper-step-name']", "Partner DAO").should('be.visible')
    })
  })
})