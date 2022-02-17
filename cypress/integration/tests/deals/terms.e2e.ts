import {
  Given,
  Then,
  When,
} from "@badeball/cypress-cucumber-preprocessor/methods";
import { EditingCard } from "../components/editingCard.e2e";

const UPDATED = "(updated)";
const MAX_NUMBER_OF_CLAUSES = 10;

class Terms {
  static addClauseButton() {
    return cy.get("[data-test='addClauseButton']");
  }
  static addClause() {
    this.addClauseButton().scrollIntoView().click();
  }
  static getClauses() {
    return cy.get("[data-test='termsClause']");
  }
  static getClauseError() {
    return cy.get("[data-test='clauseFormInput']");
  }
}

Given("I add content to a Clause", () => {
  cy.get("[data-test='clauseTextarea'] textarea").type(UPDATED);
});

Given("I have {int} existing Clauses", (numOfClauses: number) => {
  Terms.getClauses().should("have.length", 1);

  for (let i = 1; i < numOfClauses; i += 1) {
    Terms.addClause();
  }
});

When("I add a Clause", () => {
  Terms.addClause();
});

When("I save the changes", () => {
  EditingCard.click("Save");
});

When("I delete the latest Clause", () => {
  Terms.getClauses().last().within(() => {
    EditingCard.click("Delete");
  });
});

Then("I should only have 1 Clause", () => {
  Terms.getClauses().should("have.length", 1);
});

Then("I can view the Terms stage", () => {
  cy.get("[data-test='stageHeaderTitle']")
    .should("be.visible")
    .should("contain.text", "Terms");

  cy.get("[data-test='stageSectionSidebarTitle']")
    .should("be.visible")
    .should("contain.text", "Deal Clauses");
});

Then("the new Clause should appear", () => {
  EditingCard.assertView(UPDATED);
});

Then("I am not able to add another Clause", () => {
  Terms.getClauses().should("have.length", MAX_NUMBER_OF_CLAUSES);
  Terms.addClauseButton().should("not.exist");
});

Then("I have {int} Clauses", (numOfClauses: number) => {
  Terms.getClauses().should("have.length", numOfClauses);
});

Then("I should get an error message", () => {
  Terms.getClauseError().should("be.visible");
});
