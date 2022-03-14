import { Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("all the wizard registration data should be presented", () => {
/* prettier-ignore */ console.log("TCL ~ file: submit-stage.e2e.ts ~ line 4 ~ Then ~ registration");

});

Then("I should be notified, that the registration was successful", () => {
  cy.get("[data-test='congratulatePopup']").should("be.visible");
});