import {
  Given,
  Then,
  When,
} from "@badeball/cypress-cucumber-preprocessor/methods";

const playgroundRoute = "/playground";
const CHANGED_TEXT = "(changed)";
const DELETED_TEXT = "(deleted)";

Given("I navigate to the {string} component", (componentName: string) => {
  const url = `${playgroundRoute}/${componentName}Playground`;
  cy.visit(url);
});

When("I {string} the card", (buttonType: string) => {
  cy.contains("[data-test='cardFooter'] pbutton", buttonType).click();
});

Then("the content of the card should be save", () => {
  cy.contains("[data-test=viewText]", CHANGED_TEXT).should("be.visible");
})

Then("I can edit the content of the card", () => {
  cy.contains("[data-test=editText]", CHANGED_TEXT).should("be.visible");
});

Then("I get into the {string} mode", (cardMode: string) => {
  cy.contains("[data-test='cardFooter'] pbutton", cardMode).should(
    "be.visible"
  );
});

Then("the card should be deleted", () => {
  cy.contains("[data-test='cardFooter'] pbutton", "Delete").click();
  cy.contains("[data-test=editText]", DELETED_TEXT).should("be.visible");
});
