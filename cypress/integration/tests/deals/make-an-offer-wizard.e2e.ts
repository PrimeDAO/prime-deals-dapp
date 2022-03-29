import { Given, Then, And } from "@badeball/cypress-cucumber-preprocessor/methods";
import { E2eDealsApi } from "../../common/deal-api";

// @TODO this should be changed to make an offer to a real proposal (probably via clicking "make an offer" to and open proposal)
Given("I navigate to make an offer wizard", () => {
  E2eDealsApi.getFirstOpenProposalId().then(openProposalId => {
    cy.visit(`/make-an-offer/${openProposalId}/proposal`);
    cy.get("[data-test='stageHeaderTitle']", {timeout: 10000}).should("be.visible");
  });
});

Given("I navigate to make an offer Primary DAO stage", () => {
  E2eDealsApi.getFirstOpenProposalId().then(openProposalId => {
    cy.visit(`/make-an-offer/${openProposalId}/primary-dao`);
    cy.get("[data-test='stageHeaderTitle']", {timeout: 10000}).should("be.visible");
  });
});

Then("I can see DAO details section with pre-filled disabled fields", () => {
  cy.get("[data-test=\"dao-details-section\"]").within(() => {
    cy.get("[data-test=\"section-title\"]").should("have.text", "Primary DAO");

    cy.contains("pform-input", "Primary DAO Name").within(() => {
      cy.get("input").should("be.disabled").invoke("val").should("have.length.at.least", 1);
    });

    cy.contains("pform-input", "Primary DAO Treasury Address").within(() => {
      cy.get("input").should("be.disabled").invoke("val").should("have.length.at.least", 1);
    });

    cy.get("[data-test=\"dao-avatar-section\"]").within(() => {
      cy.contains("pform-input", "Primary DAO Avatar").within(() => {
        cy.get("input").should("be.disabled").invoke("val").should("have.length.at.least", 1);
      });

      cy.get("[data-test=\"dao-avatar\"]")
        .should("have.css", "width", "64px")
        .and("have.css", "height", "64px");
    });

    cy.get("[data-test=\"remove-social-media\"]").should("not.exist");
    cy.get("[data-test=\"add-social-media\"]").should("not.exist");
  });
});

And("I can see DAO representatives section with pre-filled disabled fields", () => {
  cy.get("[data-test=\"dao-representatives-section\"]").within(() => {
    cy.get("[data-test=\"section-title\"]").should("have.text", "Select Representatives");
    cy.get("[data-test=\"section-description\"]").should("be.visible");
    cy.contains("div", "Primary DAO - Representatives Addresses (Max. 5)");
    cy.get("[data-test=\"dao-representatives-addresses-field\"]").should(($representatives) => {
      expect($representatives).to.have.length.greaterThan(0);
    });
    cy.get("[data-test=\"dao-representatives-addresses-field\"]").each(($representative) => {
      cy.wrap($representative).within(() => {
        cy.get("input").should("be.disabled");
      });
    });
    cy.get("[data-test=\"remove-dao-representative\"]").should("not.exist");
    cy.get("[data-test=\"add-dao-representative\"]").should("not.exist");
  });
});
