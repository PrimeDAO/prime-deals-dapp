import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import { MINIMUM_OPEN_PROPOSAL_ID_2, MINIMUM_OPEN_PROPOSAL } from "../../fixtures/dealFixtures";
import { E2eDeals } from "../tests/deals/deals.e2e";
import { E2eWallet } from "../tests/wallet.e2e";
import { E2eWizard } from "./deal-wizard";

export class E2EDashboard {
  public static editDeal() {
    cy.contains("pbutton", "Edit deal").click();

    E2eWizard.waitForWizardLoaded();
  }
}

Given("I'm viewing the Open Proposal", () => {
  const url = `deal/${MINIMUM_OPEN_PROPOSAL_ID_2}`;
  cy.visit(url);

  cy.get(".dealDashboardContainer", {timeout: 10000}).should("be.visible");
});

Given("I'm the Proposal Lead of an Open Proposal", () => {
  const leadAddress = MINIMUM_OPEN_PROPOSAL.proposalLead.address;

  E2eWallet.currentWalletAddress = leadAddress;
  E2eDeals.currentDeal = MINIMUM_OPEN_PROPOSAL;

  // Make sure Deal exists, if not create
  const dealExists = false;
  if (dealExists) {
    // Create Deal
  }

});

Given("I edit the Open Proposal", () => {
  E2EDashboard.editDeal();
});

Then("I can edit the Open Proposal", () => {
  E2EDashboard.editDeal();
});
