import {
  Given,
  Then,
  When,
} from "@badeball/cypress-cucumber-preprocessor/methods";
import { EditingCard } from "../components/editingCard.e2e";

const UPDATED = "(updated.)";
const MAX_NUMBER_OF_CLAUSES = 10;

export class Terms {
  static addClauseButton() {
    return cy.get("[data-test='addClauseButton']");
  }
  static addClause() {
    this.addClauseButton().scrollIntoView().click();
  }
  static getClauses() {
    return cy.get("[data-test='termsClause']");
  }
  static getClausesTextarea() {
    return cy.get("[data-test='clauseTextarea'] textarea");
  }
  static getClausesText() {
    return cy.get("[data-test='clauseFormInput'] pre");
  }
  static getClauseError() {
    return cy.get("[data-test='errorMessage']");
  }
  static getUnsavedChangesError() {
    return cy.contains("[data-test='errorMessage']", "Please save all your clauses");
  }
}

Given("I add content to a Clause", () => {
  Terms.getClausesTextarea().type(UPDATED);
});

Given("I add content to the first Clause", () => {
  Terms.getClausesTextarea().first().type(UPDATED);
});

Given("I add content to the last Clause", () => {
  Terms.getClausesTextarea().last().type(UPDATED);
});

Given("I have {int} existing Clause(s)", (numOfClauses: number) => {
  Terms.getClauses().should("have.length", 1);

  for (let i = 1; i < numOfClauses; i += 1) {
    Terms.addClause();
  }
});

When("I add a Clause", () => {
  Terms.addClause();
});

When("I save the changes to the Clause", () => {
  EditingCard.click("Save");
});

When("I save the changes to the first Clause", () => {
  Terms.getClauses().first().within(() => {
    EditingCard.click("Save");
  });
});

When("I save the changes to the last Clause", () => {
  Terms.getClauses().last().within(() => {
    EditingCard.click("Save");
  });
});

When("I edit the last Clause", () => {
  Terms.getClauses().last().within(() => {
    EditingCard.click("Edit");
  });
});

When("I delete the last Clause", () => {
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

Then("I should get an error message for the Clause", () => {
  Terms.getClauseError().should("be.visible");
});

Then("I should get not an error message for the Clause", () => {
  Terms.getUnsavedChangesError().should("not.be.visible");
});

Then("I should get {int} errors for the Clauses", (numOfErros: number) => {
  Terms.getClauseError().should("have.length", numOfErros);
});

Then("I can see my existing Clauses", () => {
  // const CLAUSE_TEXT = "Threeeeeeee";
  // Terms.getClausesText().should("contain.text", CLAUSE_TEXT);
});

Then("the Clause's content should be cleared", () => {
  Terms.getClausesTextarea().invoke("val").should("equal", "");
});

Then("I cannot delete the Clause", () => {
  EditingCard.getButton("Delete").should("not.exist");
});

Then("the first Clause should be in View mode", () => {
  Terms.getClauses().first().within(() => {
    EditingCard.getButton("Edit").should("be.visible");
  });
});
