import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import { IDealRegistrationTokenSwap } from "../../../../src/entities/DealRegistrationTokenSwap";
import { openProposalId1 } from "../../../fixtures/dealFixtures";

export class E2eDeals {
  public static currentDeal: IDealRegistrationTokenSwap | undefined = undefined;
}

Given("I navigate to the All Deals page", () => {
  cy.get("[data-test='all-deals-button']").click();
  cy.url().should("include", "initiate");
});

Given("I choose Deal Type", () => {
  cy.get("[data-test='initiate-deal-button']").click();
  cy.url().should("include", "initiate");

  cy.contains("div", "Choose Deal Type").should("be.visible");
});

Given("I Open Proposals", () => {
  cy.contains("li", "Open Proposals").click();
  cy.url().should("include", "deals/open");
});

Given("I want to see Running Deals", () => {
  cy.contains("li", "Running Deals").click();
  cy.url().should("include", "deals/running");
});

Then("I can read about the deal types", () => {
  cy.log("todo");
});

Then("I can edit the deal", () => {
  const url = `open-proposal/${openProposalId1}`;
  cy.visit(url);
  cy.get("[data-test='stageHeaderTitle']", {timeout: 10000}).should("be.visible");
});
