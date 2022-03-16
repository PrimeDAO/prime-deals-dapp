import { And, Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("I can view the current status of the Partnered Deal", () => {});

Then("I can view the title of the Partnered Deal", () => {});

And("I can view the description of the Partnered Deal", () => {
  cy.get("[data-test='dealDescriptionText']").should("be.visible");
});
