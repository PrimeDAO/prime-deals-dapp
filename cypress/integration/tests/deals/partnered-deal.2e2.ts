import { Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("I can see stages correct for Partnered Deal", () => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", "Proposal").should("be.visible").within(() => {
      cy.contains("div.value", "1").should("be.visible");
      cy.contains("[data-test='pstepper-step-name']", "Proposal").should("be.visible");
    });
    cy.contains("[data-test='pstepper-step']", "Lead Details").should("be.visible").within(() => {
      cy.contains("div.value", "2").should("be.visible");
      cy.contains("[data-test='pstepper-step-name']", "Lead Details").should("be.visible");
    });
    cy.contains("[data-test='pstepper-step']", "Primary DAO").should("be.visible").within(() => {
      cy.contains("div.value", "3").should("be.visible");
      cy.contains("[data-test='pstepper-step-name']", "Primary DAO").should("be.visible");
    });
    cy.contains("[data-test='pstepper-step']", "Partner DAO").should("be.visible").within(() => {
      cy.contains("div.value", "4").should("be.visible");
      cy.contains("[data-test='pstepper-step-name']", "Partner DAO").should("be.visible");
    });
  });
});

Then("I should be alerted, that a Representative can only be part of one DAO", () => {
  // Click outside to trigger validation on blur
  cy.get(".navbar-container .logo").click();

  const errorMessage = "The same account cannot represent more than one DAO";
  cy.contains("[data-test='errorMessage']", errorMessage).should("be.visible");
});
