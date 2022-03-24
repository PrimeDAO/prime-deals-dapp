import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

const wizardTitlesToURLs = {
  "Open proposal": "open-proposal",
  "Partnered Deal": "partnered-deal",
  "Make an offer": "make-an-offer",
} as const;

const stageTitlesToURLs = {
  "Proposal": "proposal",
  "Lead Details": "lead-details",
  "Primary DAO": "primary-dao",
  "Partner DAO": "partner-dao",
  "Token Details": "token-details",
  "Terms": "terms",
  "Submit": "submit",
} as const;

export let sectionTitle = "";

export function withinWizardSection() {
  if (sectionTitle === "") {
    const sectionErrorMessage = "Please specify the section you are targeting in the Wizard.\n"
      + "Use the following step:\n\n"
      + "  Given I want to fill in information for the \"<sectionName>\" section";
    throw Error(sectionErrorMessage);
  }

  return cy.contains("[data-test='section-title']", sectionTitle).parents(".stageSection");
}

Given(/^I want to fill in information for the "(.*)" section$/, (_sectionTitle: string) => {
  sectionTitle = _sectionTitle;
});

Then("I am presented the option to choose a partner", () => {
  cy.url().should("match", /(initiate\/token-swap$)/);
});

When("I go to previous step", () => {
  cy.url().then(url => {
    const oldUrl = url;
    cy.get("[data-test='wizard-previous-button']").click();
    cy.url().should("not.equal", oldUrl);
  });
});

When("I try to proceed to next step", () => {
  cy.get("[data-test='wizard-proceed-button']").click();
});

When("I use the stepper to go to the {string} step", (stepName: string) => {
  cy.url().then(url => {
    const oldUrl = url;
    cy.contains("[data-test='pstepper-step-name']", stepName).click();
    cy.url().should("not.equal", oldUrl);
  });
});

When("I try to submit the registration data", () => {
  cy.get("[data-test='wizard-submit-button']").click();
});

When("I try to navigate to the {string} stage via stepper", (stageTitle: string) => {
  cy.get("[data-test='wizard-manager-stepper']").within(() => {
    cy.contains("[data-test='pstepper-step']", stageTitle).click();
  });
});

Given("I navigate to the {string} {string} stage", (wizardTitle: keyof typeof wizardTitlesToURLs, stageTitle: keyof typeof stageTitlesToURLs) => {
  if (!wizardTitlesToURLs[wizardTitle]) {
    throw new Error(`Wizard ${wizardTitle} does not exist in the list`);
  }
  if (!stageTitlesToURLs[stageTitle]) {
    throw new Error(`Stage  ${stageTitle} does not exist in the list`);
  }

  if (wizardTitle === "Make an offer") {
    const dealId = "open_deals_stream_hash_1";
    const url = `make-an-offer/${dealId}/${stageTitlesToURLs[stageTitle]}`;
    cy.visit(url).wait(1500);
    return;
  }

  cy.visit(`/initiate/token-swap/${wizardTitlesToURLs[wizardTitle]}/${stageTitlesToURLs[stageTitle]}`).wait(1500);
});

Given("I navigate to the Make an offer {string} stage", (stageTitle: keyof typeof stageTitlesToURLs) => {
  const url = `/make-an-offer/open_deals_stream_hash_1/${stageTitlesToURLs[stageTitle]}`;
  cy.visit(url);
});

When("I'm viewing the Partnered Deal Dashboard", () => {
  const dealId = "partnered_deals_stream_hash_2";
  const url = `/deal/${dealId}`;
  cy.visit(url);

  cy.get(".dealDashboardContainer", {timeout: 10000}).should("be.visible");
});

Given("I edit a \"Partnered Deal\"", () => {
  const dealId = "partnered_deals_stream_hash_3";
  const url = `partnered-deal/${dealId}/edit/submit`;
  cy.visit(url);
});

Then("I am presented with the {string} {string} stage", (wizardTitle: keyof typeof wizardTitlesToURLs, stageTitle: keyof typeof stageTitlesToURLs) => {
  if (!wizardTitlesToURLs[wizardTitle]) {
    throw new Error(`Wizard ${wizardTitle} does not exist in the list`);
  }
  if (!stageTitlesToURLs[stageTitle]) {
    throw new Error(`Stage ${stageTitle} does not exist in the list`);
  }
  cy.url().should("contain", `/initiate/token-swap/${wizardTitlesToURLs[wizardTitle]}/${stageTitlesToURLs[stageTitle]}`);
});

When("I fill in the {string} field with an invalid address {string}", (field: string, invalidAddress: string) => {
  withinWizardSection().within(() => {
    cy.get(`[data-test='proposal-${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
      cy.get("input, textarea").type(invalidAddress);
    });
  });
});

When("I fill in the {string} field with {string}", (field: string, value: string) => {
  withinWizardSection().within(() => {
    cy.get(`[data-test='proposal-${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
      cy.get("input, textarea").type(value);
    });

    if (field === "Token address") {
      waitForTokenAddressLoaded();
    }
  });
});

When("I fill in the {string} field with {string} in the {string} section", (field: string, value: string, section: string) => {
  cy.get(`[data-test='${section.toLowerCase().replaceAll(" ", "-")}']`).within(() => {
    cy.get(`[data-test='proposal-${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
      cy.get("input, textarea").type(value);
    });
  });
});

Then("I am presented with the {string} error message for the {string} field", (message: string, field: string) => {
  cy.get(`[data-test='proposal-${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
    cy.get(".errorMessage").should("be.visible");
    cy.get(".errorMessage").should("contain.text", message);
  });
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
