import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";

export class E2eNavigation {
  public static navigateToHomePage() {
    cy.contains(".navbar-container a", "Home").click();

    cy.get("[data-test='home-page']").should("be.visible");
  }
}

Given("I navigate to the Deals home page", () => {
  cy.visit("/");

  cy.get("[data-test='home-page']").should("be.visible");
  cy.url().then(url => {
    expect(url).to.include("home");
  });
});
