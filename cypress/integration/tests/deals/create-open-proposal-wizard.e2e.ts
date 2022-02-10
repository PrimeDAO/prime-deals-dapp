import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate create open proposal wizard", () => {
  cy.visit("/initiate/token-swap/open-proposal/proposal");
});

Then("I am presented with Open Proposal proposal stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/open-proposal\/proposal$)/)
})

Then("I am presented with Open Proposal proposal lead stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/open-proposal\/proposal-lead$)/)
})

Then("I am presented with Open Proposal primary dao stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/open-proposal\/primary-dao$)/)
})

Then("I can see stages correct for open proposal", () => {
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
  })
})