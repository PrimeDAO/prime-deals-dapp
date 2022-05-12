import { When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { E2eDealsApi } from "./deal-api";
import { PAGE_LOADING_TIMEOUT } from "./test-constants";

export class E2eDealDashboard {
  public static getContainer() {
    return cy.get("[data-test='deal-dashboard-container']", { timeout: PAGE_LOADING_TIMEOUT });
  }
}

When("I'm viewing a private Deal", () => {
  E2eDealsApi.getFirstPrivateDealId().then(privateDealId => {
    const dealId = privateDealId;
    const url = `/deal/${dealId}`;
    // cy.pause();
    // cy.visit(url);
    console.clear();
    cy.visit("http://localhost:3340/deal/eiwT8G8zRcpv7fLUiBBavm");

    E2eDealDashboard.getContainer().should("be.visible");
  });
});
