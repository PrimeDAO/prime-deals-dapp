import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";

export class E2eNavigation {
  public static navigateToHomePage() {
    cy.visit("/");
    cy.get("[data-test='home-page']").should("be.visible");
  }

  public static useNavbaroForHomePage() {
    cy.contains(".navbar-container a", "Home").click();

    cy.get("[data-test='home-page']").should("be.visible");
  }

  public static isHome(pathName: string) {
    const homePaths = ["/", "/home"];
    return homePaths.includes(pathName);
  }

  public static hasAppLoaded() {
    return cy.window().then((window) => {
      const { pathname } = window.location;
      return pathname !== "blank"; // Cypress returns "blank" if app not loaded yet
    });
  }
}

Given("I navigate to the Deals home page", () => {
  cy.visit("/");

  cy.get("[data-test='home-page']").should("be.visible");
});
