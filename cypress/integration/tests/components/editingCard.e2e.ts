import {
  Given,
  Then,
  When,
} from "@badeball/cypress-cucumber-preprocessor/methods";

const playgroundRoute = "/playground";
const CHANGED_TEXT = "(changed)";
const DELETED_TEXT = "(deleted)";

type EditincCardButtonTypes = "Edit" | "Save" | "Delete";

export class EditingCard {
  static button = "[data-test='cardFooter'] pbutton";
  static viewContent = "[data-test=editingCardViewContent]";
  static editContent = "[data-test=editingCardEditContent]";

  static assert(selector: string, expected: string) {
    cy.contains(selector, expected).should("be.visible");
  }
  static assertView(expected: string) {
    this.assert(this.viewContent, expected);
  }
  static assertEdit(expected: string) {
    this.assert(this.editContent, expected);
  }
  static click(buttonType: EditincCardButtonTypes) {
    cy.contains(EditingCard.button, buttonType).click();
  }
}

Given("I navigate to the {string} component", (componentName: string) => {
  const url = `${playgroundRoute}/${componentName}Playground`;
  cy.visit(url);
});

When("I {string} the card", (buttonType: EditincCardButtonTypes) => {
  EditingCard.click(buttonType);
});

Then("the content of the card should be save", () => {
  EditingCard.assertView(CHANGED_TEXT);
});

Then("I can edit the content of the card", () => {
  EditingCard.assertEdit(CHANGED_TEXT);
});

Then("I get into the {string} mode", (cardMode: string) => {
  EditingCard.assert(EditingCard.button, cardMode);
});

Then("the card should be deleted", () => {
  EditingCard.click("Delete");
  EditingCard.assertEdit(DELETED_TEXT);
});
