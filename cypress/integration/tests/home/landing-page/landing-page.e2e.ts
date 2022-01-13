/// <reference types="Cypress" />

import { Given } from "@badeball/cypress-cucumber-preprocessor/methods";
Given("a step", () => {
  expect(true).to.equal(false);
});
