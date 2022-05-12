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
