import { Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("all the wizard registration data should be presented", () => {
  expect("TODO").to.equal("TODO");
});

Then("I should be notified, that the registration was successful", () => {
  cy.get("[data-test='congratulatePopup']").should("be.visible");
});

// Then("the I should get the correct label "Make Deal Private" for the Privacy part", () => {})
Then("the I should get the correct label {string} for the Privacy part", (privacyLabelText: string) => {
  cy.contains(".submitContentLabel", privacyLabelText).should("be.visible");
});
