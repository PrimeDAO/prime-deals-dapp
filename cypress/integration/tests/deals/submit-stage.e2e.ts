import { Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("all the wizard registration data should be presented", () => {
  expect("TODO").to.equal("TODO");
});

Then("I should be notified, that the registration was successful", () => {
  cy.get("[data-test='congratulatePopup']").within(() => {
    cy.contains("pbutton button", "Go to deal").click();
  });

  /**
   * Bug: Flakiness in closing the dialog, sometimes the dialog is still present (but not visible).
   *   the `.whenClosed` call back does not get called in the dialogController.
   *
   * I'll leave it uncommented for now, maybe we can just remove it
   */
  // cy.get("[data-test='congratulatePopup']").should("not.exist");
});

// Then("the I should get the correct label "Make Deal Private" for the Privacy part", () => {})
Then("the I should get the correct label {string} for the Privacy part", (privacyLabelText: string) => {
  cy.contains(".submitContentLabel", privacyLabelText).should("be.visible");
});
