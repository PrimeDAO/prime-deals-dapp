import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";
import { E2eDealWizard } from "../../common/pageObjects/dealWizard";
import { EditingCard } from "../components/editingCard.e2e";
import { E2eWallet } from "../wallet.e2e";
import { E2eDeals } from "./deals.e2e";
import { Terms } from "./terms.e2e";

Given("I fill out the Proposal Stage", () => {
  E2eDealWizard.inWizardSection("Proposal")
    .inField("Proposal Title").fillIn(E2eDeals.currentDeal.proposal.title)
    .inField("Proposal Summary").fillIn(E2eDeals.currentDeal.proposal.summary)
    .inField("Proposal Description").fillIn(E2eDeals.currentDeal.proposal.description);
});

Given("I fill out the Lead Details Stage", () => {
  const address = E2eDeals.currentDeal.proposalLead.address || E2eWallet.currentWalletAddress;
  E2eDealWizard.inWizardSection("Proposal")
    .inField("Proposal Lead Address").fillIn(address);
});

Given("I fill out the Primary DAO Stage", () => {
  E2eDealWizard.inWizardSection("Primary DAO")
    .inField("DAO Name").fillIn(E2eDeals.currentDeal.primaryDAO.name)
    .inField("DAO Treasury Address").fillIn(E2eDeals.currentDeal.primaryDAO.treasury_address)
    .inField("DAO Avatar").fillIn(E2eDeals.currentDeal.primaryDAO.logoURI);

  E2eDealWizard.inWizardSection("Select Representatives")
    .inField("DAO Representatives Addresses").fillIn(E2eDeals.currentDeal.primaryDAO.representatives[0].address);

  if (E2eDeals.currentDeal.primaryDAO.representatives.length > 1) {
    E2eDeals.currentDeal.primaryDAO.representatives.forEach((representative, index) => {
      /** Already addded first representative */
      if (index === 0) return;

      E2eDealWizard.addDaoRepresentative();
      E2eDealWizard.inWizardSection("Select Representatives")
        .inField("DAO Representatives Addresses").fillIn(representative.address);
    });
  }
});

Given("I fill out the Terms Stage", () => {
  E2eDealWizard.inWizardSection("Deal Clauses");
  Terms.getClausesTextarea().type(E2eDeals.currentDeal.terms.clauses[0].text);
  EditingCard.click("Save");

  if (E2eDeals.currentDeal.terms.clauses.length > 1) {
    E2eDeals.currentDeal.terms.clauses.forEach((clause, index) => {
      /** Already addded first clause */
      if (index === 0) return;

      Terms.addClause();
      E2eDealWizard.inWizardSection("Deal Clauses");
      Terms.getClausesTextarea().type(clause.text);
      EditingCard.click("Save");
    });
  }

  Terms.getClausesText().should("have.length", E2eDeals.currentDeal.terms.clauses.length);
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
