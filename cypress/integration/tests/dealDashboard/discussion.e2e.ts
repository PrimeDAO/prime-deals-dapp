import { Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { PAGE_LOADING_TIMEOUT } from "../../common/test-constants";

export class E2eDiscussion {
  public static getDealClauses() {
    return cy.get("[data-test='deal-clauses']");
  }

  public static getAddOrReadButton() {
    return cy.get("[data-test='add-or-read-button']");
  }

  public static getDiscussionsList() {
    return cy.get("[data-test='discussions-list']");
  }

  public static clickSingleComment({numberOfReplies}: {numberOfReplies: number}) {
    cy.get("[data-test='single-comment']").within(() => {
      // Click on first comment, that satisfies match
      cy.contains("[data-test='number-of-replies']", new RegExp(`^${numberOfReplies}$`))
        .first()
        .click();
    });

    return this;
  }

  public static waitForNoCommentsText() {
    cy.get("[data-test='comments-loading']").should("be.visible");
    cy.get("[data-test='no-comments-text']", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
  }

  public static getCommentInputSection() {
    return cy.get("[data-test='comment-input-section']");
  }
}

When("I choose a Single Comment without replies", () => {
  E2eDiscussion
    .clickSingleComment({numberOfReplies: 0})
    .waitForNoCommentsText();
});

Then("I should not be able to see Discussions", () => {
  E2eDiscussion.getDealClauses().should("not.exist");
});

Then("I cannot begin a Discussion", () => {
  E2eDiscussion.getAddOrReadButton().should("not.exist");
});

Then("I'm informed about who can participate in Discussions", () => {
  E2eDiscussion.getDiscussionsList().within(() => {
    cy.contains("[data-test='discussions-list-instructions'] a", "Connect").should("be.visible");
  });
});

Then("I cannot add a Comment", () => {
  E2eDiscussion.getCommentInputSection().should("not.exist");
});
