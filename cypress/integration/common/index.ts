import { And } from "@badeball/cypress-cucumber-preprocessor/methods";

And("I Wait for the modal with the message {string} to disappear", (modalContent: string) => {
  cy.contains("[data-test='modelContent']", modalContent).should("be.visible");
  cy.get("[data-test='modelContent']").should("not.be.visible");
});

And("The modal with the message {string} is hidden", (modalContent: string) => {
  cy.contains("[data-test='modelContent']", modalContent).should("not.be.visible");
});
