import { And, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { recurse } from "cypress-recurse";
import { E2eWallet } from "../tests/wallet.e2e";
import { E2eDealsApi } from "./deal-api";
import { E2eDealWizard, WizardField } from "./pageObjects/dealWizard";
import { PAGE_LOADING_TIMEOUT } from "./test-constants";

export class E2eWizard {
  public static waitForWizardLoaded() {
    cy.get("[data-test='stageHeaderTitle']", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
  }
}

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
  return cy.then(() => {
    E2eDealWizard.getSectionTitle().then((sectionTitle) => {
      if (sectionTitle === "") {
        const sectionErrorMessage = "Please specify the section you are targeting in the Wizard.\n"
        + "Use the following step:\n\n"
        + "  Given I want to fill in information for the \"<sectionName>\" section";
        throw Error(sectionErrorMessage);
      }
      return cy.contains("[data-test='section-title']", sectionTitle).parents(".stageSection");
    });
  });
}

Given(/^I want to fill in information for the "(.*)" section$/, (sectionTitle: string) => {
  E2eDealWizard.inWizardSection(sectionTitle);
});

Given("I'm in the {string} stage", (stageTitle: string) => {
  cy.contains("[data-test='pstepper-step']", stageTitle).click();
});

Then("I am presented the option to choose a partner", () => {
  cy.url().should("match", /(initiate\/token-swap$)/);
});

When("I go to previous step", () => {
  E2eDealWizard.previous();
});

When("I try to proceed to next step", () => {
  E2eDealWizard.proceed();
});

When("I use the stepper to go to the {string} step", (stepName: string) => {
  cy.url().then(url => {
    const oldUrl = url;
    cy.contains("[data-test='pstepper-step-name']", stepName).click();
    cy.url().should("not.equal", oldUrl);
  });
});

Then("The {string} step is marked as invalid", (stepName: string) => {
  cy.contains("[data-test='pstepper-step-name']", stepName)
    .parent()
    .find("pcircled-number")
    .should("not.have.class", "isValid");
});

When("I try to submit the registration data", () => {
  E2eDealWizard.submit();
});

When("I try to navigate to the {string} stage via stepper", (stageTitle: string) => {
  E2eDealWizard.stepperNavigationTo(stageTitle);
});

const lastUrl = "";
Given("I navigate to the {string} {string} stage", (wizardTitle: keyof typeof wizardTitlesToURLs, stageTitle: keyof typeof stageTitlesToURLs) => {
  if (wizardTitle === "Make an offer") {
    E2eDealsApi.getFirstOpenProposalId().then(dealId => {
      const url = `make-an-offer/${dealId}/${stageTitlesToURLs[stageTitle]}`;
      cy.visit(url);
      cy.get("[data-test='stageHeaderTitle']", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
    });
    return;
  }

  cy.visit(`/initiate/token-swap/${wizardTitlesToURLs[wizardTitle]}/${stageTitlesToURLs[stageTitle]}`);
  cy.get("[data-test='stageHeaderTitle']", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
});

Given("I navigate to the {string} Submit stage", (wizardTitle: keyof typeof wizardTitlesToURLs) => {
  if (!wizardTitlesToURLs[wizardTitle]) {
    throw new Error(`Wizard ${wizardTitle} does not exist in the list`);
  }

  cy.visit(`/initiate/token-swap/${wizardTitlesToURLs[wizardTitle]}/submit`);
  E2eDealWizard.inWizardType(wizardTitle).inStage("Submit");

  let url = `/initiate/token-swap/${wizardTitlesToURLs[wizardTitle]}/${stageTitlesToURLs["Submit"]}`;
  if (lastUrl === url) {
    url = lastUrl;
    return;
  }

  cy.visit(url);
});

Given("I edit a \"Partnered Deal\"", () => {
  E2eDealsApi.getFirstPartneredDealId().then(partneredDealId => {
    const url = `partnered-deal/${partneredDealId}/edit/submit`;
    cy.visit(url);
    cy.get("[data-test='stageHeaderTitle']", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
  });
});

Given("I edit an \"Open Proposal\"", () => {
  E2eDealsApi.getFirstOpenProposalId().then(openProposalId => {
    const url = `open-proposal/${openProposalId}/edit/submit`;
    cy.visit(url);
    cy.get("[data-test='stageHeaderTitle']", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
  });
});

Then("I am presented with the {string} {string} stage", (wizardTitle: keyof typeof wizardTitlesToURLs, stageTitle: keyof typeof stageTitlesToURLs) => {
  E2eDealWizard.inWizardType(wizardTitle).inStage(stageTitle).isInStage();
});

When("I fill in the {string} field with an invalid address {string}", (field: string, invalidAddress: string) => {
  withinWizardSection().within(() => {
    cy.get(`[data-test='${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
      cy.get("input, textarea")
        .invoke("val", invalidAddress)
        .trigger("change", { data: invalidAddress });
    });
  });
});

When("I fill in the {string} field with {string}", (field: WizardField, value: string) => {
  E2eDealWizard.inField(field);
  E2eDealWizard.fillIn(value);
});

When("I change the {string} field by adding {string}", (field: WizardField, value: string) => {
  E2eDealWizard.inField(field);
  E2eDealWizard.addToField(value);
});

And("I wait until the Token has loaded", () => {
  waitForTokenAddressLoaded();
});

When("I fill in the {string} field with {string} in the {string} section", (field: string, value: string, section: string) => {
  cy.get(`[data-test='${section.toLowerCase().replaceAll(" ", "-")}']`).within(() => {
    cy.get(`[data-test='${field.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
      cy.get("input, textarea")
        .invoke("val", value)
        .trigger("change", { data: value });
    });
  });
});

Then("I am presented with the {string} error message for the {string} field", (message: string, field: WizardField) => {
  E2eDealWizard.getSectionTitle().then((sectionTitle) => {
    E2eDealWizard.inWizardSection(sectionTitle)
      .inField(field)
      .checkErrorMessage(message);
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
  cy.get("[data-test='home-page']").should("be.visible");
  cy.url().then(url => {
    expect(url).to.include("home");
  });
});

Then("I can proceed to the next step", () => {
  cy.url().then(url => {
    const oldUrl = url;
    /**
     * Validation is async for some stages, thus immediately proceeding triggers a validation error in the stage.
     */
    cy.wait(500);
    cy.get("[data-test='wizard-proceed-button']").click();

    recurse(
      () => cy.url(),
      (url) => {
        expect(url).not.to.equal(oldUrl);
      },
      {log: false, timeout: PAGE_LOADING_TIMEOUT},
    );
  });
});

Then("I am notified, that I am unable to proceed due to validation errors", () => {
  cy.contains("[data-test='pPopupNotification']", "Unable to proceed, please check the page for validation errors")
    .should("be.visible");
});

Then("I cannot connect to get my wallet address", () => {
  E2eDealWizard.getConnectToGetWallet().should("not.exist");
});

Then("I can make myself the Proposal Lead", () => {
  E2eDealWizard.makeMyselfProposalLead();
});

Then("my address got added to the field", () => {
  E2eDealWizard.inWizardSection("Proposal Lead")
    .inField("Proposal Lead Address")
    .verifyFieldValue(E2eWallet.currentWalletAddress);
});

function waitForTokenAddressLoaded() {
  cy.contains("[data-test='tokenDetails']", "Searching token address details").should("be.visible");
  const timeoutForAddressRequest = 20000;
  cy.contains("p", "Symbol", {timeout: timeoutForAddressRequest}).should("be.visible");
}
