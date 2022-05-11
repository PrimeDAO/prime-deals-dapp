import { After, Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import {
  DealDataBuilder,
  MINIMUM_OPEN_PROPOSAL,
  PARTNERED_DEAL,
  PRIVATE_PARTNERED_DEAL,
} from "../../fixtures/dealFixtures";
import { E2eDeals } from "../tests/deals/deals.e2e";
import { E2eWallet } from "../tests/wallet.e2e";
import { E2eDealsApi } from "./deal-api";
import { E2eWizard } from "./deal-wizard";
import { E2eDealWizard } from "./pageObjects/dealWizard";
import { PAGE_LOADING_TIMEOUT } from "./test-constants";

export class E2EDashboard {
  static visitDeal(dealId?: string) {
    if (!dealId) {
      dealId = E2eDeals.currentDealId;
    }

    const url = `deal/${dealId}`;
    cy.visit(url);

    cy.get(".dealDashboardContainer", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
  }

  public static editDeal() {
    cy.contains("pbutton", "Edit deal").click();

    E2eWizard.waitForWizardLoaded();
  }

  public static checkIfADealIsSelected() {
    if (!E2eDeals.currentDeal) {
      throw new Error("Please select a deal before using this statement");
    }
  }
}

After(() => {
  cy.then(() => {
    cy.log("Reset e2e data");
    E2eWallet.reset();
    E2eDeals.reset();
    E2eDealWizard.reset();
  });
});

Given("I'm viewing the/an Open Proposal", () => {
  cy.then(() => {
    if (E2eDeals.currentDealId) {
      E2EDashboard.visitDeal();
      return;
    }

    E2eDealsApi.getFirstOpenProposalId({isLead: true}).then(dealId => {
      E2EDashboard.visitDeal(dealId);
    });
  });
});

Given("I'm viewing a new public Open Proposal", () => {
  cy.then(() => {
    if (!E2eDeals.currentDeal) {
      E2eDeals.currentDeal = MINIMUM_OPEN_PROPOSAL;
    }

    E2eDealsApi.createDeal(E2eDeals.currentDeal).then((createdDeal) => {
      E2EDashboard.visitDeal(createdDeal.id);
    });
  });
});

Given("I'm viewing a new Partnered deal as a Representative", () => {
  cy.then(() => {
    if (!E2eDeals.currentDeal) {
      E2eDeals.currentDeal = PARTNERED_DEAL;
    }
    E2eWallet.currentWalletAddress = E2eDeals.currentDeal.primaryDAO.representatives[0].address;

    E2eDealsApi.createDeal(E2eDeals.currentDeal).then((createdDeal) => {
      E2EDashboard.visitDeal(createdDeal.id);
    });
  });
});
Given("I'm viewing a new Partnered deal as a Proposal Lead", () => {
  cy.then(() => {
    if (!E2eDeals.currentDeal) {
      E2eDeals.currentDeal = PARTNERED_DEAL;
    }
    E2eWallet.currentWalletAddress = E2eDeals.currentDeal.proposalLead.address;

    E2eDealsApi.createDeal(E2eDeals.currentDeal).then((createdDeal) => {
      E2EDashboard.visitDeal(createdDeal.id);
    });
  });
});

Given("I'm viewing the Partnered Deal", () => {
  E2eDealsApi.getFirstPartneredDealId({isLead: true}).then(dealId => {
    const url = `deal/${dealId}`;
    cy.visit(url);

    cy.get(".dealDashboardContainer", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
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

Given("The deal is canceled", () => {
  E2EDashboard.checkIfADealIsSelected();
  cy.log("todo");
  // E2eDeals.currentDeal.isRejected = true ???
});

Given("I create a Private Partnered Deal", () => {
  E2eDealsApi.createDeal(PRIVATE_PARTNERED_DEAL);
});

Given("I create an Open Proposal", () => {
  const deal = E2eDeals.currentDeal ? E2eDeals.currentDeal : DealDataBuilder.create().withProposalLeadData({address: E2eWallet.currentWalletAddress}).deal;
  E2eDealsApi.createDeal(deal);
});

Given("I create a Partnered Deal", () => {
  E2eDealsApi.createDeal(PARTNERED_DEAL);
});

Then("I can edit the Open Proposal", () => {
  E2EDashboard.editDeal();
});
