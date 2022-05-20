import { After, And, Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import {
  DealDataBuilder,
  E2E_ADDRESSES,
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
    if (!E2eDeals.currentDeal && !E2eDeals.currentDealId) {
      throw new Error("Please select a deal before using this statement");
    }
  }
}

export class E2eUi {
  public static getPopup() {
    cy.contains("[data-test='pPopupNotification']").should("be.visible");
  }

  public static getErrorPopup() {
    return cy.contains("[data-test='pPopupNotification']", "Error").should("be.visible");
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

Given("I'm viewing the Partnered Deal", () => {
  E2eDealsApi.getFirstPartneredDealId({isLead: true}).then(dealId => {
    const url = `deal/${dealId}`;
    cy.visit(url);

    cy.get(".dealDashboardContainer", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
  });
});

And("I'm viewing that deal", () => {
  E2EDashboard.checkIfADealIsSelected();
  E2EDashboard.visitDeal(E2eDeals.currentDealId);
});

Given("I'm the Proposal Lead of an Open Proposal", () => {
  cy.then(() => {
    const leadAddress = MINIMUM_OPEN_PROPOSAL.proposalLead.address;
    E2eWallet.currentWalletAddress = leadAddress;
    E2eDeals.currentDeal = MINIMUM_OPEN_PROPOSAL;
  });
});

Given("I'm the Proposal Lead of a new Open Proposal", () => {
  cy.then(() => {
    E2eDeals.currentDeal = MINIMUM_OPEN_PROPOSAL;
    E2eWallet.currentWalletAddress = E2eDeals.currentDeal.proposalLead.address;

    E2eDealsApi.createDeal(E2eDeals.currentDeal);
  });
});

Given("I'm the Proposal Lead of a Partnered Deal", () => {
  cy.then(() => {
    const leadAddress = PARTNERED_DEAL.proposalLead.address;
    E2eWallet.currentWalletAddress = leadAddress;
    E2eDeals.currentDeal = PARTNERED_DEAL;
  });
});
Given("I'm the Proposal Lead of a new Partnered Deal", () => {
  cy.then(() => {
    E2eDeals.currentDeal = PARTNERED_DEAL;
    E2eWallet.currentWalletAddress = E2eDeals.currentDeal.proposalLead.address;

    E2eDealsApi.createDeal(E2eDeals.currentDeal);
  });
});

Given("I'm the Proposal Lead of the failed Partnered deal", () => {
  cy.then(() => {
    E2eWallet.currentWalletAddress = E2E_ADDRESSES.ProposalLead;

    const failedDealIDFromSeed = "3iVVBv3qENmj7GPmCCRKy6";
    E2EDashboard.visitDeal(failedDealIDFromSeed);
  });
});
Given("I'm the Proposal Lead of the funding Partnered deal", () => {
  cy.then(() => {
    E2eWallet.currentWalletAddress = E2E_ADDRESSES.ProposalLead;

    const fundingDealIDFromSeed = "pCq17fw4Y5ZK3ZqzXMBFep";
    E2EDashboard.visitDeal(fundingDealIDFromSeed);
  });
});

Given("I edit the Open Proposal", () => {
  E2EDashboard.editDeal();
});

Given("I cancel the deal", async () => {
  cy.then(() => {
    E2EDashboard.checkIfADealIsSelected();
    E2eDealsApi.getFirestoreService().updateDealIsRejected(E2eDeals.currentDealId, true);
  });
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

Then(/^an error should occur reading "(.*)"$/, (errorText: string) => {
  E2eUi.getErrorPopup().should("contain.text", errorText);
});
