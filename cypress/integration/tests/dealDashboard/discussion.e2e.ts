import { And, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { E2eDealsApi } from "../../common/deal-api";
import { PAGE_LOADING_TIMEOUT } from "../../common/test-constants";
import { E2eDeals } from "../deals/deals.e2e";
import { E2eWallet } from "../wallet.e2e";

interface ICommentOptions {
  notAuthor?: boolean;
  isAuthor?: boolean;
}

export class E2eDiscussion {
  public static replyToAddress = "";

  public static getDealClauses() {
    return cy.get("[data-test='deal-clauses']");
  }

  public static getAddOrReadButton() {
    return cy.get("[data-test='add-or-read-button']");
  }

  public static getDiscussionsList() {
    return cy.get("[data-test='discussions-list']");
  }

  public static getThreadHeader() {
    return cy.get("[data-test='discussion-thread']")
      .find("[data-test='thread-header']");
  }

  public static getSingleTopic() {
    return cy.get("[data-test='single-topic']");
  }

  public static clickSingleTopic({numberOfReplies}: {numberOfReplies?: number} = {}) {
    if (numberOfReplies === undefined) {
      E2eDiscussion.getSingleTopic().first().click();
      return this;
    }

    E2eDiscussion.getSingleTopic().within(() => {
      // Click on first comment, that satisfies match
      cy.contains("[data-test='number-of-replies']", new RegExp(`^${numberOfReplies}$`))
        .first()
        .click();
    });

    return this;
  }

  public static getSingleComment(commentOptions?: ICommentOptions) {
    E2eDiscussion.waitForCommentsLoaded();

    if (commentOptions?.notAuthor) {
      return E2eDiscussion.getSingleCommentNotAuthor();
    } else if (commentOptions?.isAuthor) {
      return E2eDiscussion.getSingleCommentFromAuthor();
    } else {
      return cy.get("[data-test='single-comment']", {timeout: PAGE_LOADING_TIMEOUT}).last();
    }
  }

  public static waitForCommentsLoaded() {
    cy.log("Wait for comment fully loaded");
    E2eDiscussion.getSingleCommentAuthor().should("be.visible");
  }

  private static getSingleCommentNotAuthor() {
    cy.log(" -- getSingleCommentNotAuthor");

    return cy.get("[data-test='single-comment']", {timeout: PAGE_LOADING_TIMEOUT})
      .find("[data-test='comment-author']:not(:contains("+ E2eWallet.getSmallHexAddress() +"))")
      .last()
      .parents("[data-test='single-comment']");
  }

  private static getSingleCommentFromAuthor() {
    cy.log(" -- getSingleCommentFromAuthor");

    return cy.contains("[data-test='single-comment'] [data-test='comment-author']", E2eWallet.getSmallHexAddress(), {timeout: PAGE_LOADING_TIMEOUT})
      .should("have.length", 1)
      .first()
      .parents("[data-test='single-comment']")
      .last();
  }

  public static getSingleCommentAuthor() {
    return cy.get("[data-test='single-comment']", {timeout: PAGE_LOADING_TIMEOUT})
      .last()
      .find("[data-test='comment-author']", {timeout: PAGE_LOADING_TIMEOUT}); // Comment author info fetched from 3rd party
  }

  public static hoverSingleComment(commentOptions?: ICommentOptions) {
    cy.log( "hoverSingleComment" );

    return E2eDiscussion.getSingleComment(commentOptions).within(() => {
      cy.get("[data-test='single-comment-action']").invoke("show");
    });
  }

  public static getLikeAction(commentOptions?: ICommentOptions) {
    return E2eDiscussion.getSingleComment(commentOptions)
      .find("[data-test='single-comment-action']")
      .find("[data-test='like-button']");
  }

  public static getReplyActionButton() {
    return E2eDiscussion.getSingleComment()
      .find("[data-test='single-comment-action']")
      .contains("button", "Reply");
  }

  public static getCancelActionButton() {
    return E2eDiscussion.getSingleComment()
      .find("[data-test='single-comment-action']")
      .contains("button", "Cancel");
  }

  public static waitForNoCommentsText() {
    cy.get("[data-test='comments-loading']").should("be.visible");
    cy.get("[data-test='no-comments-text']", {timeout: PAGE_LOADING_TIMEOUT}).should("be.visible");
  }

  public static getReplyToContainer() {
    return cy.get("[data-test='reply-to-container']");
  }

  public static getCommentInputSection() {
    return cy.get("[data-test='comment-input-section']");
  }

  public static getCommentInputButton() {
    return E2eDiscussion
      .getCommentInputSection()
      .find("[data-test='comment-input-button'] button");
  }
}

Given("the Open Proposal has Discussions", () => {
  E2eDealsApi.getOpenProposals({isLead: E2eWallet.isLead}).then(deals => {
    const dealWithDiscussions = deals.find(deal => Object.keys(deal.clauseDiscussions ?? {}).length > 0);
    if (dealWithDiscussions === undefined) {
      throw new Error("[TEST] Did not find any Open Proposals with discussions.");
    }

    E2eDeals.setDeal(dealWithDiscussions);
  });
});

Given("the Open Proposal has Discussions with replies", () => {
  E2eDealsApi.getOpenProposals({isLead: E2eWallet.isLead}).then(deals => {
    const discussionsWithReplies = deals.find((deal) => {
      const hasDiscussions = Object.keys(deal.clauseDiscussions ?? {}).length > 0;
      if (hasDiscussions === false) {
        return false;
      }

      const discussionsWithReplies = Object.values(deal.clauseDiscussions).find(dicussion => {
        return dicussion.replies > 0;
      });
      return discussionsWithReplies;
    });

    if (discussionsWithReplies === undefined) {
      throw new Error("[TEST] Did not find any Open Proposals with discussions, that have replies.");
    }

    E2eDeals.setDeal(discussionsWithReplies);
  });
});

When("I choose a single Topic without replies", () => {
  E2eDiscussion
    .clickSingleTopic({numberOfReplies: 0})
    .waitForNoCommentsText();
});

When("I choose a single Topic with replies", () => {
  // TODO: We assume a specific comment setup
  //  Can/should this be generalized?
  //  Eg. the first comment in the specific deal (of this test case), has what we need
  E2eDiscussion
    .clickSingleTopic()
    .waitForCommentsLoaded();
});

When("I view a single Comment", () => {
  E2eDiscussion.hoverSingleComment();
});

When("I view my own Comment", () => {
  E2eDiscussion.getSingleComment({isAuthor: true}).find("pre").invoke("text");
  E2eDiscussion.hoverSingleComment({isAuthor: true});
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

Then("I can reply to that Comment", () => {
  // Action on the single comment
  E2eDiscussion.getReplyActionButton().click();
  E2eDiscussion.getCancelActionButton().should("be.visible");

  E2eDiscussion.getSingleCommentAuthor().within(() => {
    cy.get("etherscanlink .text").invoke("text").then(address => {
      E2eDiscussion.replyToAddress = address.trim();
    });
  });

  // Side effects around the comment input section
  E2eDiscussion.getCommentInputButton().should("be.disabled").should("contain.text", "Reply");

  E2eDiscussion.getReplyToContainer().should("be.visible");
});

Then("I can see who I am replying to", () => {
  E2eDiscussion.getReplyToContainer().within(() => {
    cy.contains("[data-test='reply-to-address']", E2eDiscussion.replyToAddress).should("be.visible");
  });
});

Then("I can cancel replying that Comment again", () => {
  E2eDiscussion.getCancelActionButton().click();

  E2eDiscussion.getReplyToContainer().should("not.exist");
  E2eDiscussion.getCommentInputButton().should("be.disabled").should("contain.text", "Comment");
});

Then("I should not see the Comment actions", () => {
  E2eDiscussion.getSingleComment().find("[data-test='single-comment-action']").should("not.exist");
});

Then("I can like that Comment", () => {
  E2eDiscussion.getSingleComment({notAuthor: true});
});

Then("I cannot like my own Comment", () => {
  E2eDiscussion.getLikeAction({isAuthor: true}).should("not.exist");
});

Then("I should be informed of no discussions", () => {
  cy.contains("discussions-list", "Discuss").should("be.visible");
  cy.contains("section", "None of the clauses are currently being discussed.").should("be.visible");
});

Then("I can create a new Discussion", () => {
  E2eDiscussion.getAddOrReadButton().click();
  E2eDiscussion.getThreadHeader().should("be.visible");
});

Then("I am presented with the latest comment", () => {
  E2eDiscussion.getSingleComment().should("have.value");
});

And("I cannot reply to a Comment", () => {

  cy.log("todo");
});
