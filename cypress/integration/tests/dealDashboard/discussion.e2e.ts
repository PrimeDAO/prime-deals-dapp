import { And, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";
import { E2eDealsApi } from "../../common/deal-api";
import { PAGE_LOADING_TIMEOUT } from "../../common/test-constants";
import { E2eDeals } from "../deals/deals.e2e";
import { E2eWallet } from "../wallet.e2e";
import { IComment } from "../../../../src/entities/DealDiscussions";
import { CommentBuilder } from "../../../fixtures/CommentsBuilder";
import { getRandomId } from "../../../fixtures/dealFixtures";

export const GET_COMMENTS_ALIAS = "getComments";
export const DELETE_COMMENTS_ALIAS = "deleteComments";

interface ICommentOptions {
  notAuthor?: boolean;
  isAuthor?: boolean;
}

interface ICommentMetaData {
  isPrivate: string; // "false";
  allowedMembers: string; // "[\"0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498\"]";
  encrypted: string; // "";
  iv: string; // "";
}

interface IDiscussionsResponse {
  _id: string; // <unique-id-of-comment>
  createdOn: string; // <timestamp>,
  author: string; // <same-as-signerAddress>,
  text: string; // <same-as-comment>,
  url: string; // <same-as-url>,
  tid: string; // <same-as-threadId>,
  metaData: Record<string, unknown>;
  upvotes: Array<string>;
  downvotes: Array<string>;
  replyTo: string;
}

interface ICreateRequest {
  token: string; // "[E2e] Auth successfull";
  signerAddress: string; // "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498";
  comment: string; // "This comment is encrypted";
  threadId: string; // "e2e:4";
  url: string; // "https://deals.prime.xyz";
  metadata: ICommentMetaData;
  replyTo: string; // "";
}

interface IGetRequest {
  _id: string;
}

export class E2eDiscussionsProvider {
  static mockAuth() {
    const authRouteOptions = { method: "POST" };
    const successfulAuth = {
      message: "[E2e] Auth successfull",
      success: true,
    };
    const authResponse = { statusCode: 200, body: successfulAuth };
    cy.intercept("**/auth**", authRouteOptions, authResponse);

    cy.intercept("**/validateAuth**", authRouteOptions, authResponse);
  }

  public static mockAblyAuth() {
    const ablyResponse = {
      keyName: "j_DvcQ.tsXhJg",
      clientId: "convo",
      timestamp: 1649873577931,
      nonce: "1093577840631321",
      mac: "UUtg9t58hQ4k+z9N99nxj/SyxYhKWJi2wF94nAV2yRM=",
    };
    const response = { statusCode: 200, body: ablyResponse };
    const routeOptions = { method: "GET" };
    cy.intercept("**/getAblyAuth**", routeOptions, response);

    // POST
    cy.intercept("**/requestToken**", {method: "POST"}, {statusCode: 200, body: {success: true}});
    cy.intercept("**/connect?access_token**", {method: "GET"}, {statusCode: 200, body: {success: true}});
  }

  public static mockGetThread(comments?: IComment[]) {
    const response = { statusCode: 200, body: comments ?? null };
    const routeOptions = { method: "GET" };
    cy.intercept("**/comments?threadId**", routeOptions, response).as(GET_COMMENTS_ALIAS);
    cy.intercept("**/getAblyAuth**", routeOptions, response);
  }

  public static mockGetComment() {
    const getRouteOptions = { method: "GET" };
    cy.intercept("**/comment?commentId**", getRouteOptions, (req) => {
      const reqBody = req.body as IGetRequest;

      /* prettier-ignore */ console.log("TCL ~ file: discussion.e2e.ts ~ line 56 ~ E2eDiscussionsProvider ~ cy.intercept ~ req", req);
      const response: IDiscussionsResponse = {
        _id: getRandomId(),
        createdOn: Date.now().toString(),
        author: reqBody._id,
        text: "How to change this",
        url: undefined,
        tid: undefined,
        metaData: {},
        upvotes: [],
        downvotes: [],
        replyTo: undefined,
      };
      req.reply(response);
    }); //.as(GET_COMMENTS_ALIAS);

    const getResponseBody = { success: true };
    const getResponse = { statusCode: 200, body: getResponseBody };
    cy.intercept("**/getAblyAuth**", getRouteOptions, getResponse);
  }

  public static mockCreateComment() {
    cy.intercept("OPTIONS", "**/comments**");

    // const createRouteOptions = { method: "POST", statusCode: 600 };
    const createRouteOptions = { method: "POST" };
    cy.intercept("**/comments**", createRouteOptions, (req) => {
      /* prettier-ignore */ console.log("TCL ~ file: discussion.e2e.ts ~ line 104 ~ E2eDiscussionsProvider ~ cy.intercept ~ req", req);
      try {
        let reqBody = req.body;
        if (typeof req.body === "string") {
          reqBody = JSON.parse(req.body) as ICreateRequest;
        }
        /* prettier-ignore */ console.log("TCL ~ file: discussion.e2e.ts ~ line 102 ~ E2eDiscussionsProvider ~ cy.intercept ~ reqBody", reqBody);

        const response: IDiscussionsResponse = {
          _id: getRandomId(),
          createdOn: Date.now().toString(),
          author: reqBody.signerAddress,
          text: "How to change this",
          url: reqBody.url,
          tid: reqBody.threadId,
          metaData: {},
          upvotes: [],
          downvotes: [],
          replyTo: reqBody.replyTo,
        };
        /* prettier-ignore */ console.log("TCL ~ file: discussion.e2e.ts ~ line 117 ~ E2eDiscussionsProvider ~ cy.intercept ~ response", response);
        req.reply(response);
      } catch (error) {
        console.error(error);
      }
    }); //.as(CREATE_COMMENTS_ALIAS);

    const createResponseBody = { success: true };
    const createResponse = { statusCode: 200, body: createResponseBody };
    cy.intercept("**/getAblyAuth**", createRouteOptions, createResponse);
  }

  public static mockDeleteComment() {
    const deleteResponseBody = { success: true };
    const deleteResponse = { statusCode: 200, body: deleteResponseBody };
    const delteRouteOptions = { method: "DELETE" };
    cy.intercept("**/comments**", delteRouteOptions, deleteResponse).as(DELETE_COMMENTS_ALIAS);
    cy.intercept("**/getAblyAuth**", delteRouteOptions, deleteResponse);
  }
}

export class E2eDiscussion {
  public static replyToAddress = "";

  public static provider = E2eDiscussionsProvider;

  public static getDealClauses() {
    return cy.get("[data-test='deal-clauses']");
  }

  public static getAddOrReadButton() {
    return cy.get("[data-test='add-or-read-button']", {timeout: PAGE_LOADING_TIMEOUT});
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

  public static getSingleComments() {
    E2eDiscussion.waitForCommentsLoaded();
    return cy.get("[data-test='single-comment']");
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

  public static getDeleteActionButton(commentOptions?: ICommentOptions) {
    return E2eDiscussion.getSingleComment(commentOptions)
      .find("[data-test='single-comment-action']")
      .contains("button", "Delete");
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

Given("I mock the Discussions Provider", () => {
  cy.log("intercept convo");
  E2eDiscussionsProvider.mockAuth();

  const firstComment = CommentBuilder.create().withText("e2e First comment").comment;
  const replyToFirstComment = CommentBuilder.create().replyTo(firstComment).withText("Reply to the first one").comment;
  const comments = [firstComment, replyToFirstComment];
  E2eDiscussionsProvider.mockGetThread(comments);

  E2eDiscussionsProvider.mockGetComment();
  E2eDiscussionsProvider.mockCreateComment();
  E2eDiscussionsProvider.mockDeleteComment();

});

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

When("the 3rd party Discussions service has an error", () => {
  E2eDiscussionsProvider.mockGetThread();
});

When("I reload the discussions", () => {
  cy.get("[data-test='reload-discussions']").click();
});

When("I delete my Comment", () => {
  E2eDiscussion.hoverSingleComment({isAuthor: true});
  E2eDiscussion.getDeleteActionButton({isAuthor: true}).click();

  cy.wait(`@${DELETE_COMMENTS_ALIAS}`);
});

When("I delete my Comment, that has a reply", () => {
  E2eDiscussion.hoverSingleComment({isAuthor: true});
  E2eDiscussion.getDeleteActionButton({isAuthor: true}).click();

  cy.wait(`@${DELETE_COMMENTS_ALIAS}`);
});

When("I add a new Comment", () => {
  const comment = "e2e comment";
  E2eDiscussion.getCommentInputSection().find("textarea")
    .invoke("val", comment)
    .trigger("change", { data: comment });

  // E2eDiscussion.getCommentInputButton().click();
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

Then("I should be informed about the error", () => {
  cy.get("[data-test='reload-discussions']").should("be.visible");
});

Then("I should be informed, that the discussion has no comments yet", () => {
  E2eDiscussion.waitForNoCommentsText();
});

Then("the reply Comment should show, that the original message was deleted", () => {
  const repliesToCommentDeletedText = "This message has been removed.";
  E2eDiscussion.getSingleComment()
    .find("[data-test='replies-to-comment']")
    .should("have.text", repliesToCommentDeletedText);
});

Then("{int} comment(s) should be in the Thread", (numberOfComments: number) => {
  E2eDiscussion.getSingleComments().should("have.length", numberOfComments);
});

And("I cannot reply to a Comment", () => {

  cy.log("todo");
});
