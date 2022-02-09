import { Given, Then, When, And } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I navigate to create partnered deal wizard", () => {
  cy.visit("/initiate/token-swap/partnered-deal/proposal");
});

Given("I navigate to create partnered deal wizard Primary DAO stage", () => {
  cy.visit("/initiate/token-swap/partnered-deal/primary-dao");
});

Given("I navigate to create partnered deal wizard Partner DAO stage", () => {
  cy.visit("/initiate/token-swap/partnered-deal/partner-dao");
});

Then("I am presented with Partnered Deal proposal stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/partnered-deal\/proposal$)/)
})

Then("I am presented with Partnered Deal proposal lead stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/partnered-deal\/proposal-lead$)/)
})

Then("I am presented with Partnered Deal primary dao stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/partnered-deal\/primary-dao$)/)
})

Then("I am presented with Partnered Deal partner dao stage", () => {
  cy.url().should("match", /(initiate\/token-swap\/partnered-deal\/partner-dao$)/)
})

Then("I can see stages correct for Partnered Deal", () => {
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
    cy.contains("[data-test='pstepper-step']", "Partner DAO").should("be.visible").within(() => {
      cy.contains("div.value", "4").should('be.visible')
      cy.contains("[data-test='pstepper-step-name']", "Partner DAO").should('be.visible')
    })
  })
})

Then('I can see Partner DAO section with inputs for collecting its details', () => {
  cy.get('[data-test="dao-details-section"]').within(() => {
    cy.get('[data-test="section-title"]').should('have.text', 'Partner DAO')
    cy.get('[data-test="section-description"]').should('have.text', 'Please fill in the details of the partner DAO who will be participating in the deal.')

    cy.contains('pform-input', 'Partner DAO Name').within(() => {
      cy.get('input').should('be.visible')
    })
    
    cy.contains('pform-input', 'Partner DAO Treasury Address').within(() => {
      cy.get('input').should('be.visible')
    })

    cy.get('[data-test="dao-avatar-section"]').within(() => {
      cy.contains('pform-input', 'Partner DAO Avatar').within(() => {
        cy.get('input').should('be.visible')
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

Then('I can see Partner DAO Representatives section', () => {
  cy.get('[data-test="dao-representatives-section"]').within(() => {
    cy.get('[data-test="section-title"]').should('have.text', 'Representatives')
    cy.get('[data-test="section-description"]').should('be.visible')
    cy.contains('div', 'Partner DAO - Representatives Addresses (Max. 5)');
    cy.get('[data-test="dao-representative"]').should(($item) => {
      expect($item).to.have.length(1);
    });
    cy.get('[data-test="add-dao-representative"]').should('have.text', '+ Additional representative')
  })
})