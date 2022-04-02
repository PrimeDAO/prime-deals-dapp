import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import { DealDataBuilder, MINIMUM_OPEN_PROPOSAL, PARTNERED_DEAL, PRIVATE_PARTNERED_DEAL } from "../../fixtures/dealFixtures";
import { E2eDeals } from "../tests/deals/deals.e2e";
import { E2eWallet } from "../tests/wallet.e2e";
import { E2eDealsApi } from "./deal-api";
import { E2eWizard } from "./deal-wizard";

export class E2EDashboard {
  public static editDeal() {
    cy.contains("pbutton", "Edit deal").click();

    E2eWizard.waitForWizardLoaded();
  }
}

Given("I'm viewing (the/an) Open Proposal", () => {
  cy.then(() => {
    if (E2eDeals.currentDealId) {
      const url = `deal/${E2eDeals.currentDealId}`;
      cy.visit(url);

      cy.get(".dealDashboardContainer", {timeout: 10000}).should("be.visible");
      return;
    }

    E2eDealsApi.getFirstOpenProposalId({isLead: true}).then(dealId => {
      const url = `deal/${dealId}`;
      cy.visit(url);

      cy.get(".dealDashboardContainer", {timeout: 10000}).should("be.visible");
    });
  });
});

Given("I'm viewing the Partnered Deal", () => {
  E2eDealsApi.getFirstPartneredDealId({isLead: true}).then(dealId => {
    const url = `deal/${dealId}`;
    cy.visit(url);

    cy.get(".dealDashboardContainer", {timeout: 10000}).should("be.visible");
  });
});

Given("I'm the Proposal Lead of an Open Proposal", () => {
  cy.then(() => {
    const leadAddress = MINIMUM_OPEN_PROPOSAL.proposalLead.address;
    E2eWallet.currentWalletAddress = leadAddress;
    E2eDeals.currentDeal = MINIMUM_OPEN_PROPOSAL;
  });
});

Given("I'm the Proposal Lead of a Partnered Deal", () => {
  cy.then(() => {
    const leadAddress = PARTNERED_DEAL.proposalLead.address;
    E2eWallet.currentWalletAddress = leadAddress;
    E2eDeals.currentDeal = PARTNERED_DEAL;
  });
});

Given("I edit the Open Proposal", () => {
  E2EDashboard.editDeal();
});

Given("I create a Private Partnered Deal", () => {
  E2eDealsApi.createDeal(PRIVATE_PARTNERED_DEAL);
});

Given("I create an Open Proposal", () => {
  const deal = DealDataBuilder.create().withProposalLeadData({address: E2eWallet.currentWalletAddress}).deal;
  E2eDealsApi.createDeal(deal);
});

Given("I create a Partnered Deal", () => {
  E2eDealsApi.createDeal(PARTNERED_DEAL);
});

Then("I can edit the Open Proposal", () => {
  E2EDashboard.editDeal();
});
