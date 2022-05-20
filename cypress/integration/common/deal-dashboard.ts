import { PAGE_LOADING_TIMEOUT } from "./test-constants";

export class E2eDealDashboard { // is this still needed
  public static getContainer() {
    return cy.get("[data-test='deal-dashboard-container']", {timeout: PAGE_LOADING_TIMEOUT});
  }
}
