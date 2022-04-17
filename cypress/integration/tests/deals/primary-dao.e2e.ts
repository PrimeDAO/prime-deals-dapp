import { Given, Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to create partnered deal wizard Primary DAO stage", () => {
  cy.visit("/initiate/token-swap/partnered-deal/primary-dao");
});

Then("I can see Primary DAO section with inputs for collecting its details", () => {
  cy.get("[data-test=\"dao-details-section\"]").within(() => {
    cy.get("[data-test=\"section-title\"]").should("have.text", "Primary DAO");

    cy.contains("pform-input", "Primary DAO Name").within(() => {
      cy.get("input").should("exist");
    });

    cy.contains("pform-input", "Primary DAO Treasury Address").within(() => {
      cy.get("input").should("exist");
    });

    cy.get("[data-test=\"dao-avatar-section\"]").within(() => {
      cy.contains("pform-input", "Primary DAO Avatar").within(() => {
        cy.get("input").should("exist");
      });

      cy.get("[data-test=\"dao-avatar\"]")
        .should("have.css", "width", "64px")
        .and("have.css", "height", "64px");
    });

    cy.get("[data-test=\"dao-social-media\"]").within(() => {
      cy.contains("div", "External Links (optional)");
      cy.get("[data-test=\"add-social-media\"]").should("contain.text", "+ Add An External Link");
      // cy.get("pselect").within(() => {
      //   cy.contains(".ss-option", "Twitter");
      //   cy.contains(".ss-option", "Discord");
      //   cy.contains(".ss-option", "Telegram");
      //   cy.contains(".ss-option", "Reddit");
      //   cy.contains(".ss-option", "LinkedIn");
      // });
    });
  });
});

Then("I can see Primary DAO Representatives section", () => {
  cy.get("[data-test=\"dao-representatives-section\"]").within(() => {
    cy.get("[data-test=\"section-title\"]").should("have.text", "Select Representatives");
    cy.get("[data-test=\"section-description\"]").should("be.visible");
    cy.contains("div", "Primary DAO - Representatives Addresses (Max. 5)");
    cy.get("[data-test=\"dao-representatives-addresses-field\"]").should(($item) => {
      expect($item).to.have.length(1);
    });
    cy.get("[data-test=\"add-dao-representative\"]").should("contain.text", "+ Additional representative");
  });
});
