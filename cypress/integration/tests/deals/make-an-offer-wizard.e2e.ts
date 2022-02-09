import { Given, Then, And } from "@badeball/cypress-cucumber-preprocessor/methods";

// @TODO this should be changed to make an offer to a real proposal (probably via clicking "make an offer" to and open proposal)
const proposalId = 'open_deals_stream_id_2';

Given('I navigate to make an offer wizard', () => {
  cy.visit(`/make-an-offer/${proposalId}/proposal`);
});

Given('I navigate to make an offer Primary DAO stage', () => {
  cy.visit(`/make-an-offer/${proposalId}/primary-dao`);
})

Then('I can see DAO details section with pre-filled disabled fields', () => {
  cy.get('[data-test="dao-details-section"]').within(() => {
    cy.get('[data-test="section-title"]').should('have.text', 'Primary DAO')
    cy.get('[data-test="section-description"]').should('have.text', 'Please fill in the details of the first DAO who will be initiating the deal.')

    cy.contains('pform-input', 'Primary DAO Name').within(() => {
      cy.get('input').invoke('val').should('have.length.at.least', 1).should('be.disabled')
    })
    
    cy.contains('pform-input', 'Primary DAO Treasury Address').within(() => {
      cy.get('input').invoke('val').should('have.length.at.least', 1).should('be.disabled')
    })

    cy.get('[data-test="dao-avatar-section"]').within(() => {
      cy.contains('pform-input', 'Primary DAO Avatar').within(() => {
        cy.get('input').invoke('val').should('have.length.at.least', 1).should('be.disabled')
      })

      cy.get('[data-test="dao-avatar"]').should('have.attr', 'src')

      cy.get('[data-test="dao-avatar"]')
        .should('have.css', 'width', '64px')
        .and('have.css', 'height', '64px')
    })
  })
})

And('I can see DAO representatives section with pre-filled disabled fields', () => {
  cy.get('[data-test="dao-representatives-section"]').within(() => {
    cy.get('[data-test="section-title"]').should('have.text', 'Representatives')
    cy.get('[data-test="section-description"]').should('be.visible')
    cy.contains('div', 'Partner DAO - Representatives Addresses (Max. 5)');
    cy.get('[data-test="dao-representative"]').should(($representatives) => {
      $representatives.each(($representative) => {
        expect($representative).to.have.length.greaterThan(1);
        expect($representative).to.be.disabled();
      })
    });
    cy.get('[data-test="add-dao-representative"]').should('have.text', '+ Additional representative')
  })
})