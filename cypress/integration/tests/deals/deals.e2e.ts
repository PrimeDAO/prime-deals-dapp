import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import { IDealRegistrationTokenSwap } from "../../../../src/entities/DealRegistrationTokenSwap";
import { E2eDealsApi } from "../../common/deal-api";

export class E2eDeals {
  public static currentDeal: IDealRegistrationTokenSwap | undefined = undefined;
  public static currentDealId: string;
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
  E2eDealsApi.getFirstOpenProposalId().then(openProposalId => {
    const url = `open-proposal/${openProposalId}`;
    cy.visit(url);
    cy.get("[data-test='stageHeaderTitle']", {timeout: 10000}).should("be.visible");
  });
});
