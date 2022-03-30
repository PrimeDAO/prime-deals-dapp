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
}

Given("I navigate to the Deals home page", () => {
  cy.visit("/");

  cy.get("[data-test='home-page']").should("be.visible");
});
