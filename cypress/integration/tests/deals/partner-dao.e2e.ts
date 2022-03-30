import { Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("I can see Partner DAO section with inputs for collecting its details", () => {
  cy.get("[data-test=\"dao-details-section\"]").within(() => {
    cy.get("[data-test=\"section-title\"]").should("have.text", "Partner DAO");

    cy.contains("pform-input", "Partner DAO Name").within(() => {
      cy.get("input").should("be.visible");
    });

    cy.contains("pform-input", "Partner DAO Treasury Address").within(() => {
      cy.get("input").should("be.visible");
    });

    cy.get("[data-test=\"dao-avatar-section\"]").within(() => {
      cy.contains("pform-input", "Partner DAO Avatar").within(() => {
        cy.get("input").should("be.visible");
      });

      cy.get("[data-test=\"dao-avatar\"]")
        .should("have.css", "width", "64px")
        .and("have.css", "height", "64px");
    });

    cy.get("[data-test=\"dao-social-media\"]").within(() => {
      cy.contains("div", "Social media (optional)");
      cy.get("[data-test=\"add-social-media\"]").should("contain.text", "+ Add social media");
      cy.get("pselect").within(() => {
        cy.contains(".ss-option", "Twitter");
        cy.contains(".ss-option", "Discord");
        cy.contains(".ss-option", "Telegram");
        cy.contains(".ss-option", "Reddit");
        cy.contains(".ss-option", "LinkedIn");
      });
    });
  });
});

Then("I can see Partner DAO Representatives section", () => {
  cy.get("[data-test=\"dao-representatives-section\"]").within(() => {
    cy.get("[data-test=\"section-title\"]").should("have.text", "Select Representatives");
    cy.get("[data-test=\"section-description\"]").should("be.visible");
    cy.contains("div", "Partner DAO - Representatives Addresses (Max. 5)");
    cy.get("[data-test=\"dao-representatives-addresses-field\"]").should(($item) => {
      expect($item).to.have.length(1);
    });
    cy.get("[data-test=\"add-dao-representative\"]").should("contain.text", "+ Additional representative");
  });
});
