import { When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { PAGE_LOADING_TIMEOUT } from "./test-constants";

When("I'm viewing a private Deal", () => {
  const dealId = "open_deals_stream_hash_1";
  const url = `/deal/${dealId}`;
  cy.visit(url);

  cy.get("[data-test='dealDashboardContainer']", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
});
