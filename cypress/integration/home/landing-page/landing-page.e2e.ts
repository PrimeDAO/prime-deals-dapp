/// <reference types="Cypress" />

import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";
Given("a step", () => {
  expect(true).to.equal(false);
});


// context("Landing page", () => {
//   beforeEach(() => {
//     cy.visit("/");
//   });

//   describe("All Deals", () => {
//     it("Navigate to All Deals", () => {
//       cy.get("[data-test='all-deals-button']").click();
//       cy.url().should("include", "initiate");
//     });
//   });

//   describe("Initiate a Deal", () => {
//     it("Choose Deal Type", () => {
//       cy.get("[data-test='initiate-deal-button']").click();
//       cy.url().should("include", "initiate");

//       cy.contains("div", "Choose Deal Type").should("be.visible");
//     });
//   });

//   describe("Open Deals", () => {
//     it("Open Deals", () => {
//       cy.contains("li", "Open Deals").click();
//       cy.url().should("include", "deals/open");
//     });
//   });

//   describe("Running Deals", () => {
//     it("Running Deals", () => {
//       cy.contains("li", "Running Deals").click();
//       cy.url().should("include", "deals/running");
//     });
//   });
// });
