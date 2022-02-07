import { Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("I am presented the option to choose a partner", () => {
  cy.url().should("match", /(initiate\/token-swap$)/)
})

When("I go to previous step", () => {
  cy.url().then(url => {
    const oldUrl = url;
    cy.get("[data-test='wizard-previous-button']").click();
    cy.url().should('not.equal', oldUrl);
  })
})

When("I try to proceed to next step", () => {
  cy.get("[data-test='wizard-proceed-button']").click();
})

When("I try to navigate to proposal stage via stepper", () => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", "Proposal").click();
  });
})

When("I try to navigate to proposal lead stage via stepper", () => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", "Lead Details").click();
  });
})

When("I try to navigate to primary dao stage via stepper", () => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", "Primary DAO").click();
  });
})

When("I try to navigate to partner dao stage via stepper", () => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", "Partner DAO").click();
  });
})

When("I fill in proposal title correctly", () => {
  cy.get("[data-test='proposal-title-field']").within(() => {
    cy.get('input').type('Test proposal').invoke('val').should('have.length.at.least', 1)
  })
})

When("I fill in proposal summary with text that is too short", () => {
  cy.get("[data-test='proposal-summary-field']").within(() => {
    cy.get('textarea').type('asd').invoke('val').should('have.length.at.most', 9);
  })
})

When("I fill in proposal description with text that is too short", () => {
  cy.get("[data-test='proposal-description-field']").within(() => {
    cy.get('textarea').type('asd123asd').invoke('val').should('have.length.at.most', 9);
  })
})

When("I fill in proposal summary with text that meets requirements", () => {
  cy.get("[data-test='proposal-summary-field']").within(() => {
    cy.get('textarea').type('Test summary').invoke('val').should('have.length.at.least', 10);
  })
})

When("I fill in proposal description with text that meets requirements", () => {
  cy.get("[data-test='proposal-description-field']").within(() => {
    cy.get('textarea').type('Test description').invoke('val').should('have.length.at.least', 10);
  })
})

Then("I am presented with errors proposal stage required errors", () => {
  cy.get("[data-test='proposal-title-field']").within(() => {
    cy.get('.errorMessage').should('contain.text', 'Required Input')
  })
  cy.get("[data-test='proposal-summary-field']").within(() => {
    cy.get('.errorMessage').should('contain.text', 'Required Input')
  })
  cy.get("[data-test='proposal-description-field']").within(() => {
    cy.get('.errorMessage').should('contain.text', 'Required Input')
  })
})

Then("I am presented with too short input errors for proposal summary and description", () => {
  cy.get("[data-test='proposal-title-field']").within(() => {
    cy.get('.errorMessage').should('not.exist')
  })
  cy.get("[data-test='proposal-summary-field']").within(() => {
    cy.get('.errorMessage').should('contain.text', 'Input is too short')
  })
  cy.get("[data-test='proposal-description-field']").within(() => {
    cy.get('.errorMessage').should('contain.text', 'Input is too short')
  })
})
