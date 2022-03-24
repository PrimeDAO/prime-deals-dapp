import { And, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

Given("I go to the All Deals page", () => {
  cy.visit("/deals");
});

Then("I can see Initiate A Deal button", () => {
  cy.get("[data-test='initiate-deal-button']");
});
And("I can see Open Proposals tab", () => {
  cy.contains("span", "Open Proposals").should("be.visible").should("have.class", "active");
});
And("I can see Partnered Deals tab", () => {
  cy.contains("span", "Partnered Deals").should("be.visible").should("not.have.class", "active");
});
And("I can see Open Proposals Carousel", () => {
  cy.get("horizontal-scroller").should("be.visible").children().children().children("deal-summary").should("have.length.at.least", 3);
});
And("I can see All Deals grid", () => {
  cy.contains("div", "All open proposals").should("be.visible");
  cy.get("[data-test='all-deals-grid']").should("be.visible").children("a").should("have.length", 10);
});

When("I select Partnered Deals tab", () => {
  cy.get("[data-test='partnered-deals-tab']").click();
});

Then("I can see Partnered Deals", () => {
  cy.contains("span", "Open Proposals").should("be.visible").should("not.have.class", "active");
  cy.contains("span", "Partnered Deals").should("be.visible").should("have.class", "active");
  cy.get("horizontal-scroller").should("be.visible").children().children().children("deal-summary").should("have.length.greaterThan", 4);
  cy.contains("div", "All partnered deals").should("be.visible");
  cy.get("[data-test='all-deals-grid']").should("be.visible").children("a").should("have.length.greaterThan", 4);
});
