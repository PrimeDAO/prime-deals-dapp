import { Then } from "@badeball/cypress-cucumber-preprocessor/methods";

Then("I can view the Terms stage", () => {
  cy.get("[data-test='stageHeaderTitle']")
    .should("be.visible")
    .should("contain.text", "Terms");

  cy.get("[data-test='stageSectionSidebarTitle']")
    .should("be.visible")
    // .scrollIntoView();
    // .scrollIntoView({ offset: { top: -550, left: 0 } });

  /* prettier-ignore */ console.log('TCL ~ file: terms.e2e.ts ~ line 4 ~ Then ~ Then')
});
