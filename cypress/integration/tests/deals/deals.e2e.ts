import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import { IDealTokenSwapDocument } from "entities/IDealTypes";
import { IDealRegistrationTokenSwap } from "../../../../src/entities/DealRegistrationTokenSwap";

export class E2eDeals {
  public static currentDeal: IDealRegistrationTokenSwap | undefined = undefined;
  /**
   * Note: dealId is internal to Firestore, thus does not live along `currentDeal`.
   */
  public static currentDealId: string;

  /**
   * Set deal data for testing:
   * 1. The created deal (registration data)
   * 2. The deal id (firestore id)
   */
  public static setDeal(createdDeal: IDealTokenSwapDocument): void {
    this.currentDeal = createdDeal.registrationData;
    this.currentDealId = createdDeal.id;
  }
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
