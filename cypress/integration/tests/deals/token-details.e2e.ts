import { And, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { withinWizardSection } from "../../common/deal-wizard";

Given("I add a Token Details form", () => {
  withinWizardSection().within(() => {
    cy.contains("button", "Add token").click();

    cy.get("[data-test='tokenDetails']").should("have.length.greaterThan", 0);
  });
});

Given("I have {int} Token Details forms?", (numOfForms: number) => {
  withinWizardSection().within(() => {
    cy.get("[data-test='tokenDetails']").should("have.length", 1);

    for (let i = 1; i < numOfForms; i += 1) {
      cy.contains("button", "Add token").click();
    }

    cy.get("[data-test='tokenDetails']").should("have.length", numOfForms);
  });
});

When("I try to save the Token Details form", () => {
  withinWizardSection().within(() => {
    cy.get("[data-test='saveTokenDetail']").click();

    cy.get("[data-test='loadingIcon']").should("be.visible");
    cy.get("[data-test='loadingIcon']").should("not.exist");
  });

});

Then("I am presented with an empty Token Details form", () => {
  cy.get("[data-test='tokenDetails']").should("be.visible");
});

Then("I cannot delete a Token Details form", () => {
  cy.get("[data-test='deleteTokenDetail']").should("be.not.exist");
});

Then("I can delete a Token Details form", () => {
  cy.get("[data-test='deleteTokenDetail']").should("have.length", 2);
});

And("the Token Details form was not saved", () => {
  withinWizardSection().within(() => {
    cy.get("[data-test='saveTokenDetail']").should("be.visible");
  });
});
