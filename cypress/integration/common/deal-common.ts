import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";
import { openProposalId1, OPEN_PROPOSAL_1 } from "../../fixtures/dealFixtures";
import { E2eDeals } from "../tests/deals/deals.e2e";
import { E2eWallet } from "../tests/wallet.e2e";

Given("I'm viewing an Open Proposal", () => {
  const url = `deal/${openProposalId1}`;
  cy.visit(url);

  cy.get(".dealDashboardContainer", {timeout: 10000}).should("be.visible");
});

Given("I'm the Proposal Lead of an Open Proposal", () => {
  const leadAddress = OPEN_PROPOSAL_1.proposalLead.address;

  E2eWallet.currentWalletAddress = leadAddress;
  E2eDeals.currentDeal = OPEN_PROPOSAL_1;

  // Make sure Deal exists, if not create
  const dealExists = false;
  if (dealExists) {
    // Create Deal
  }

});
