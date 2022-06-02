/// <reference types="Cypress" />

import { And, Given } from "@badeball/cypress-cucumber-preprocessor/methods";
// import { MINIMUM_OPEN_PROPOSAL } from "../../../../fixtures/dealFixtures";
import { E2eNavigation } from "../../../common/navigate";

export class E2eHomePage {
  public static focusOpenProposal() {
    cy.get("[data-test='open-proposals-tab']").click();

  }

  public static verifyNumberOfOpenProposals({atLeast}: {atLeast: number}) {
    cy.get("[data-test='deal-summary']", {timeout: 20000})
      .should("have.length.greaterThan", atLeast - 1); // - l for "greaterThan or equal"
  }

  public static getOpenProposal({title}: {title: string}) {
    cy.contains("[data-test='deal-summary'] .title", title);
  }
}

Given("a step", () => {
  expect(true).to.equal(false);
});

// And("the newly created Deal is displayed on the landing page", () => {
//   E2eNavigation.useNavbarForHomePage();

//   E2eHomePage.verifyNumberOfOpenProposals({atLeast: 1});
//   E2eHomePage.getOpenProposal({title: MINIMUM_OPEN_PROPOSAL.proposal.title});
// });
