import { stageTitlesToURLs, withinWizardSection, wizardTitlesToURLs } from "../deal-wizard";

export type WizardField =
 "Proposal Title"
 | "Proposal Summary"
 | "Proposal Description"
 | "Proposal Lead Address"
 | "Contact Email"
 //  | "Primary DAO Name"
 | "DAO Name"
 | "DAO Treasury Address"
 | "DAO Avatar"
 | "DAO Representatives Addresses"
 | "Funding Period"

export class DealWizard {
  private static sectionTitle = "";
  public static getSectionTitle() {
    return cy.then(() => {
      return this.sectionTitle;
    });
  }

  private static fieldTitle = "";
  private static wizardTitle: keyof typeof wizardTitlesToURLs;
  private static stageTitle: keyof typeof stageTitlesToURLs;

  public static inWizardType(wizardTitle: keyof typeof wizardTitlesToURLs) {
    if (!wizardTitlesToURLs[wizardTitle]) {
      throw new Error(`Wizard ${wizardTitle} does not exist in the list`);
    }

    this.wizardTitle = wizardTitle;
    return this;
  }

  public static inStage(stageTitle: keyof typeof stageTitlesToURLs) {
    if (!stageTitlesToURLs[stageTitle]) {
      throw new Error(`Stage ${stageTitle} does not exist in the list`);
    }

    this.stageTitle = stageTitle;
    return this;
  }

  static inWizardSection(sectionTitle: string) {
    cy.then(() => {
      this.sectionTitle = sectionTitle;
    });
    return this;
  }

  static inField(fieldTitle: WizardField) {
    cy.then(() => {
      this.fieldTitle = fieldTitle;
    });
    return this;
  }

  static fillIn(value: string) {
    cy.then(() => {
      withinWizardSection().within(() => {
        cy.get(`[data-test='${this.fieldTitle.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
          cy.get("input, textarea").type(value);
        });

        if (this.fieldTitle === "Token address") {
          // waitForTokenAddressLoaded();
        }
      });
    });
    return this;
  }

  static proceed() {
    cy.get("[data-test='wizard-proceed-button']").click();
  }

  static previous() {
    cy.url().then(url => {
      const oldUrl = url;
      cy.get("[data-test='wizard-previous-button']").click();
      cy.url().should("not.equal", oldUrl);
    });
  }

  static submit() {
    cy.get("[data-test='wizard-submit-button']").click();
  }

  public static isInStage() {
    if (!wizardTitlesToURLs[this.wizardTitle]) {
      throw new Error(`Wizard ${this.wizardTitle} does not exist in the list`);
    }
    if (!stageTitlesToURLs[this.stageTitle]) {
      throw new Error(`Stage ${this.stageTitle} does not exist in the list`);
    }
    cy.url().should("contain", `/initiate/token-swap/${wizardTitlesToURLs[this.wizardTitle]}/${stageTitlesToURLs[this.stageTitle]}`);
  }

  public static isStillInSameStage() {
    if (!wizardTitlesToURLs[this.wizardTitle]) {
      throw new Error(`Wizard ${this.wizardTitle} does not exist in the list`);
    }
    if (!stageTitlesToURLs[this.stageTitle]) {
      throw new Error(`Stage ${this.stageTitle} does not exist in the list`);
    }
    cy.url().should("contain", `/initiate/token-swap/${wizardTitlesToURLs[this.wizardTitle]}/${stageTitlesToURLs[this.stageTitle]}`);
  }

  // ------- Stepper
  public static stepperNavigationTo(stepName: string) {
    cy.get("[data-test='wizard-manager-stepper']").within(() => {
      cy.contains("[data-test='pstepper-step']", stepName).click();
    });
  }

  // ------- Errors
  public static checkErrorMessage(message: string) {
    cy.then(() => {
      cy.get(`[data-test='${this.fieldTitle.toLowerCase().replaceAll(" ", "-")}-field']`).within(() => {
        cy.get(".errorMessage").should("be.visible");
        cy.get(".errorMessage").should("contain.text", message);
      });
    });
  }
}
