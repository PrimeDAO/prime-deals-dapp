import { And, Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

const MOBILE_MAX_LENGTH = 250;

When("the description text is long", () => {
  cy.get("[data-test='dealDescriptionText']")
    .invoke("text").then(descriptionText => {
      expect(descriptionText.trim().endsWith("...")).to.equal(true);
      const cleanedLength = descriptionText.trim().length - 3; // - 3: "..." ellipsis dots
      expect(cleanedLength).to.equal(MOBILE_MAX_LENGTH);
    });
});

Then("I can view the current status of the Partnered Deal", () => {
  cy.get("[data-test='dealStatus']").should("be.visible");
});

Then("I can view the title of the Partnered Deal", () => {
  cy.get("[data-test='dealTitle']").should("be.visible");
});

And("I can view the description of the Partnered Deal", () => {
  cy.get("[data-test='dealDescriptionText']").should("be.visible");
});

Then("I can expand the text to read more", () => {
  cy.get("[data-test='readMoreDealDescription']").click();
  cy.get("[data-test='dealDescriptionText']")
    .invoke("text")
    .then(descriptionText => {
      const cleaned = descriptionText.trim();
      expect(cleaned.length >= MOBILE_MAX_LENGTH).equals(true);
    });
});
