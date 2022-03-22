import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { DealWizard } from "./pageObjects/dealWizard";

export const wizardTitlesToURLs = {
  "Open proposal": "open-proposal",
  "Partnered Deal": "partnered-deal",
  "Make an offer": "make-an-offer",
} as const;

export const stageTitlesToURLs = {
  "Proposal": "proposal",
  "Lead Details": "lead-details",
  "Primary DAO": "primary-dao",
  "Partner DAO": "partner-dao",
  "Token Details": "token-details",
  "Terms": "terms",
  "Submit": "submit",
} as const;

export function withinWizardSection() {
  const sectionTitle = DealWizard.getSectionTitle();
  return cy.contains("[data-test='section-title']", sectionTitle).parents(".stageSection");
}

Given(/^I want to fill in information for the "(.*)" section$/, (_sectionTitle: string) => {
  DealWizard.inWizardSection(_sectionTitle);
});

Then("I am presented the option to choose a partner", () => {
  cy.url().should("match", /(initiate\/token-swap$)/);
});

When("I go to previous step", () => {
  DealWizard.previous();
});

When("I try to proceed to next step", () => {
  DealWizard.proceed();
});

When("I try to submit the registration data", () => {
  cy.get("[data-test='wizard-submit-button']").click();
});

When("I try to navigate to the {string} stage via stepper", (stageTitle: string) => {
  DealWizard.stepperNavigationTo(stageTitle);
});

const lastUrl = "";
Given("I navigate to the {string} {string} stage", (wizardTitle: keyof typeof wizardTitlesToURLs, stageTitle: keyof typeof stageTitlesToURLs) => {
  if (wizardTitle === "Make an offer") {
    const dealId = "open_deals_stream_hash_1";
    const url = `make-an-offer/${dealId}/${stageTitlesToURLs[stageTitle]}`;
    cy.visit(url);
    return;
  }

  DealWizard.inWizardType(wizardTitle).inStage(stageTitle);

  let url = `/initiate/token-swap/${wizardTitlesToURLs[wizardTitle]}/${stageTitlesToURLs[stageTitle]}`;
  if (lastUrl === url) {
    url = lastUrl;
    return;
  }

  cy.visit(url);
});

Given("I navigate to the Make an offer {string} stage", (stageTitle: keyof typeof stageTitlesToURLs) => {
  const url = `/make-an-offer/open_deals_stream_hash_1/${stageTitlesToURLs[stageTitle]}`;
  cy.visit(url);
});

When("I'm viewing the Partnered Deal Dashboard", () => {
  const dealId = "partnered_deals_stream_hash_2";
  const url = `/deal/${dealId}`;
  cy.visit(url);

  cy.get(".dealDashboardContainer").should("be.visible");
});

Given("I edit a \"Partnered Deal\"", () => {
  const dealId = "partnered_deals_stream_hash_3";
  const url = `partnered-deal/${dealId}/edit/submit`;
  cy.visit(url);
});

Then("I am presented with the {string} {string} stage", (wizardTitle: keyof typeof wizardTitlesToURLs, stageTitle: keyof typeof stageTitlesToURLs) => {
  DealWizard.inWizardType(wizardTitle).inStage(stageTitle).isInStage();
});

When("I fill in the {string} field with an invalid address", (field: string) => {
  const invalidAddress = "invalid address";
  withinWizardSection().within(() => {
    cy.get(`[data-test='proposal-${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
      cy.get("input, textarea").type(invalidAddress);
    });
  });
});

When("I fill in the {string} field with {string}", (field: string, value: string) => {
  DealWizard.inField(field).fillIn(value);
});

When("I fill in the {string} field with {string} in the {string} section", (field: string, value: string, section: string) => {
  // DealWizard.inWizardSection(section).inField(field).fillIn(value);

  cy.get(`[data-test='${section.toLowerCase().replaceAll(" ", "-")}']`).within(() => {
    cy.get(`[data-test='proposal-${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
      cy.get("input, textarea").type(value);
    });
  });
});

Then("I am presented with the {string} error message for the {string} field", (message: string, field: string) => {
  DealWizard.inField(field).checkErrorMessage(message);
});

When("I'm in the {string} section", (sectionHeading: string) => {
  cy.contains(".stageSectionSidebar .heading.title", sectionHeading)
    .should("be.visible");
});

Then("the {string} option should be turned off", (optionText: string) => {
  cy.get(`pform-input[label='${optionText}']`).within(() => {
    cy.contains(optionText).should("be.visible");
    cy.get("[data-test='pToggleInput']").invoke("val").should("equal", "false");
  });
});

Then("I should get an error notification", () => {
  cy.contains("[data-test='pPopupNotification']", "Error").should("be.visible");
});

Then("I should be redirected to the Home Page", () => {
  cy.url().then(url => {
    expect(url).to.include("home");
  });
});

Then("I can proceed to the next step", () => {
  cy.url().then(url => {
    const oldUrl = url;
    cy.get("[data-test='wizard-proceed-button']").click();
    cy.url().should("not.equal", oldUrl);
  });
});

Then("I am notified, that I am unable to proceed due to validation errors", () => {
  cy.contains("[data-test='pPopupNotification']", "Unable to proceed, please check the page for validation errors")
    .should("be.visible");
});

function waitForTokenAddressLoaded() {
  cy.contains("[data-test='tokenDetails']", "Searching token address details").should("be.visible");
  const timeoutForAddressRequest = 20000;
  cy.contains("p", "Symbol", {timeout: timeoutForAddressRequest}).should("be.visible");
}
