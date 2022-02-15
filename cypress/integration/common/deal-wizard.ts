import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

const wizardTitlesToURLs = {
  'Open proposal': 'open-proposal',
  'Partnered Deal': 'partnered-deal',
  'Make an offer': 'make-an-offer',
} as const

const stageTitlesToURLs = {
  'Proposal': 'proposal',
  'Lead Details': 'lead-details',
  'Primary DAO': 'primary-dao',
} as const

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

When("I try to navigate to the {string} stage via stepper", (stageTitle: string) => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", stageTitle).click();
  });
})

Given("I navigate to the {string} {string} stage", (wizardTitle: keyof typeof wizardTitlesToURLs, stageTitle: keyof typeof stageTitlesToURLs) => {
  if (!wizardTitlesToURLs[wizardTitle]) {
    throw new Error(`Wizard ${wizardTitle} does not exist in the list`)
  }
  if (!stageTitlesToURLs[stageTitle]) {
    throw new Error(`Stage  ${stageTitle} does not exist in the list`)
  }
  cy.visit(`/initiate/token-swap/${wizardTitlesToURLs[wizardTitle]}/${stageTitlesToURLs[stageTitle]}`);
});

Then("I am presented with the {string} {string} stage", (wizardTitle: keyof typeof wizardTitlesToURLs, stageTitle: keyof typeof stageTitlesToURLs) => {
  if (!wizardTitlesToURLs[wizardTitle]) {
    throw new Error(`Wizard ${wizardTitle} does not exist in the list`)
  }
  if (!stageTitlesToURLs[stageTitle]) {
    throw new Error(`Stage ${stageTitle} does not exist in the list`)
  }
  cy.url().should("contain", `/initiate/token-swap/${wizardTitlesToURLs[wizardTitle]}/${stageTitlesToURLs[stageTitle]}`);
});

When("I fill in the {string} field with {string}", (field: string, value: string) => {
  cy.get(`[data-test='proposal-${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
    cy.get("input, textarea").type(value);
  });
});

Then("I am presented with the {string} error message for the {string} field", (message: string, field: string) => {
  cy.get(`[data-test='proposal-${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
    cy.get(".errorMessage").should("contain.text", message);
  });
});


When("I'm in the {string} section", (sectionHeading: string) => {
  cy.contains(".stageSectionSidebar .heading.title", sectionHeading)
   .should("be.visible")
})

Then("the {string} option should be turned off", (optionText: string) => {
  cy.get(`pform-input[label='${optionText}']`).within(formComponent => {
    cy.contains(optionText).should("be.visible")
    cy.get("[data-test='pToggleInput']").invoke("val").should("equal", "false")
  })
})
