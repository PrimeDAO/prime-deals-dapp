import { Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { E2eDealDashboard } from "../../common/deal-dashboard";

When("I am able go to funding page", () => {
  E2eDealDashboard.getFundingButton().should("be.visible");
});

Then("I can navigate to funding page", () => {
  E2eDealDashboard.getFundingButton().click();
});

Then("I am on the funding page", () => {
  cy.url().should("contain", "funding");
  cy.get("[data-test='funding-container']").should("be.visible");
});

Then("I am able to see my dao deposit grid", () => {
  cy.get("[data-test='deposit-grid']").should("have.length", 1).should("be.visible");
});

Then("I am able to see both dao deposit grids", () => {
  cy.get("[data-test='deposit-grid']").should("have.length", 2).should("be.visible");
});

Then("I am able to see the deposit form", () => {
  cy.get("[data-test='deposit-form']").should("be.visible");
});

Then("I am not able to see the deposit form", () => {
  cy.get("[data-test='deposit-form']").should("not.be.visible");
});

Then("I am able to see the token swap status section", () => {
  cy.get("[data-test='token-swap-status']").should("be.visible");
});

Then("I am able to see the deposits section", () => {
  cy.get("[data-test='deposits-section']").should("be.visible");
});
