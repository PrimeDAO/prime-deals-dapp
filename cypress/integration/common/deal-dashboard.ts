import { When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { E2E_DEALS, PAGE_LOADING_TIMEOUT } from "./test-constants";

export class E2eDealDashboard {
  public static getContainer() {
    return cy.get("[data-test='deal-dashboard-container']", { timeout: PAGE_LOADING_TIMEOUT });
  }
}

When("I'm viewing a public Deal", () => {
  const dealId = E2E_DEALS.PUBLIC;
  const url = `/deal/${dealId}`;
  cy.visit(url);

  E2eDealDashboard.getContainer().should("be.visible");
});

When("I'm viewing a private Deal", () => {
  const dealId = "open_deals_stream_hash_1";
  const url = `/deal/${dealId}`;
  cy.visit(url);

  E2eDealDashboard.getContainer().should("be.visible");
});
