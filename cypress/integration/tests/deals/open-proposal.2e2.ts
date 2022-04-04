import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import { MINIMUM_OPEN_PROPOSAL } from "../../../fixtures/dealFixtures";
import { E2eDealWizard } from "../../common/pageObjects/dealWizard";
import { EditingCard } from "../components/editingCard.e2e";
import { E2eWallet } from "../wallet.e2e";
import { Terms } from "./terms.e2e";

Given("I fill out the Proposal Stage", () => {
  E2eDealWizard.inWizardSection("Proposal")
    .inField("Proposal Title").fillIn(MINIMUM_OPEN_PROPOSAL.proposal.title)
    .inField("Proposal Summary").fillIn(MINIMUM_OPEN_PROPOSAL.proposal.summary)
    .inField("Proposal Description").fillIn(MINIMUM_OPEN_PROPOSAL.proposal.description);
});

Given("I fill out the Lead Details Stage", () => {
  const address = E2eWallet.currentWalletAddress || MINIMUM_OPEN_PROPOSAL.proposalLead.address;
  E2eDealWizard.inWizardSection("Proposal")
    .inField("Proposal Lead Address").fillIn(address);
});

Given("I fill out the Primary DAO Stage", () => {
  E2eDealWizard.inWizardSection("Primary DAO")
    .inField("DAO Name").fillIn(MINIMUM_OPEN_PROPOSAL.primaryDAO.name)
    .inField("DAO Treasury Address").fillIn(MINIMUM_OPEN_PROPOSAL.primaryDAO.treasury_address)
    .inField("DAO Avatar").fillIn(MINIMUM_OPEN_PROPOSAL.primaryDAO.logoURI);

  E2eDealWizard.inWizardSection("Select Representatives")
    .inField("DAO Representatives Addresses").fillIn(MINIMUM_OPEN_PROPOSAL.primaryDAO.representatives[0].address);

});

Given("I fill out the Terms Stage", () => {
  E2eDealWizard.inWizardSection("Deal Clauses");
  Terms.getClausesTextarea().type(MINIMUM_OPEN_PROPOSAL.terms.clauses[0].text);
  EditingCard.click("Save");

});

Then("I can see stages correct for open proposal", () => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", "Proposal").should("be.visible").within(() => {
      cy.contains("div.value", "1").should("be.visible");
      cy.contains("[data-test='pstepper-step-name']", "Proposal").should("be.visible");
    });
    cy.contains("[data-test='pstepper-step']", "Lead Details").should("be.visible").within(() => {
      cy.contains("div.value", "2").should("be.visible");
      cy.contains("[data-test='pstepper-step-name']", "Lead Details").should("be.visible");
    });
    cy.contains("[data-test='pstepper-step']", "Primary DAO").should("be.visible").within(() => {
      cy.contains("div.value", "3").should("be.visible");
      cy.contains("[data-test='pstepper-step-name']", "Primary DAO").should("be.visible");
    });
  });
});
