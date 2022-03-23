import { Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("I should not be able to see Discussions", () => {
  cy.get("deal-clauses").should("not.exist");
});
