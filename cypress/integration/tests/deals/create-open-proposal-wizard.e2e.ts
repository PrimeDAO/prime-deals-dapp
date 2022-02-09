import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate create open proposal wizard", () => {
  cy.visit("/initiate/token-swap/open-proposal/proposal");
});

Given("I navigate create open proposal wizard Primary DAO stage", () => {
  cy.visit("/initiate/token-swap/open-proposal/primary-dao");
});

Then("I am presented with Open Proposal proposal stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/open-proposal\/proposal$)/)
})

Then("I am presented with Open Proposal proposal lead stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/open-proposal\/proposal-lead$)/)
})

Then("I am presented with Open Proposal primary dao stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/open-proposal\/primary-dao$)/)
})

Then("I can see stages correct for open proposal", () => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", "Proposal").should("be.visible").within(() => {
      cy.contains("div.value", "1").should('be.visible')
      cy.contains("[data-test='pstepper-step-name']", "Proposal").should('be.visible')
    })
    cy.contains("[data-test='pstepper-step']", "Lead Details").should("be.visible").within(() => {
      cy.contains("div.value", "2").should('be.visible')
      cy.contains("[data-test='pstepper-step-name']", "Lead Details").should('be.visible')
    })
    cy.contains("[data-test='pstepper-step']", "Primary DAO").should("be.visible").within(() => {
      cy.contains("div.value", "3").should('be.visible')
      cy.contains("[data-test='pstepper-step-name']", "Primary DAO").should('be.visible')
    })
  })
})

Then('I can see Primary DAO section with inputs for collecting its details', () => {
  cy.get('[data-test="dao-details-section"]').within(() => {
    cy.get('[data-test="section-title"]').should('have.text', 'Primary DAO')
    cy.get('[data-test="section-description"]').should('have.text', 'Please fill in the details of the first DAO who will be initiating the deal.')

    cy.contains('pform-input', 'Primary DAO Name').within(() => {
      cy.get('input').should('exist')
    })
    
    cy.contains('pform-input', 'Primary DAO Treasury Address').within(() => {
      cy.get('input').should('exist')
    })

    cy.get('[data-test="dao-avatar-section"]').within(() => {
      cy.contains('pform-input', 'Primary DAO Avatar').within(() => {
        cy.get('input').should('exist')
      })

      cy.get('[data-test="dao-avatar"]')
        .should('have.css', 'width', '64px')
        .and('have.css', 'height', '64px')
    })

    cy.get('[data-test="dao-social-media"]').within(() => {
      cy.contains('div', 'Social media (optional)');
      cy.get('[data-test="add-social-media"]').should('have.text', '+ Add social media')
      cy.get('pselect').within(() => {
        cy.contains('.ss-option', 'Twitter')
        cy.contains('.ss-option', 'Discord')
        cy.contains('.ss-option', 'Telegram')
        cy.contains('.ss-option', 'Reddit')
        cy.contains('.ss-option', 'LinkedIn')
      })
    })
  })
})

Then('I can see Primary DAO Representatives section', () => {
  cy.get('[data-test="dao-representatives-section"]').within(() => {
    cy.get('[data-test="section-title"]').should('have.text', 'Representatives')
    cy.get('[data-test="section-description"]').should('be.visible')
    cy.contains('div', 'Primary DAO - Representatives Addresses (Max. 5)');
    cy.get('[data-test="dao-representative"]').should(($item) => {
      expect($item).to.have.length(1);
    });
    cy.get('[data-test="add-dao-representative"]').should('have.text', '+ Additional representative')
  })
})