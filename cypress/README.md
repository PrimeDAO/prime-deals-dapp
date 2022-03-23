# *WIP*

## Concepts:
- [Cypress](https://docs.cypress.io/guides/overview/why-cypress)
- [BDD](https://cucumber.io/docs/bdd/)
  - [Gherkin][gherkin]
  - [Cucumber](https://cucumber.io/docs/cucumber/?sbsearch=Cucumber) - Implementation of BDD in code
    - [cypress-cucumber-preprocessor](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor)
      - [the fork we are using](https://github.com/badeball/cypress-cucumber-preprocessor)

## Setup
```
+ --- cypress/
|     + --- fixtures/
|     + --- integration/
|           + --- features/    // (1) BDD part
|           + --- tests/       // (2) Cypress part
|     + --- plugins/
|     + --- support/
```

### (1) BDD
Check out few thoughts on BDD in [Notion](https://www.notion.so/primedao/Why-BDD-100ad3b686054579a2f1c558e8646633)

### (2) Cypress
Check out few thoughts on Cypress in [Notion](https://www.notion.so/primedao/E2E-aed92af51bf74634b0d89027fe0d7817)

## Development

### Commands
`npm run e2e`
- Open a Cypress GUI, where you can develop interactively
  - Note the "Cypress Studio" feature to generate tests based on your interactions

`npm run e2e-run`
- Run all cypress tests in headless mode

### Flow
1. Single out a Specification, that you want to cover with automated tests
2. Define the Specifications in [Gherkin][gherkin] format in `.feature` files
```feature
# The singled out specification from 1.
Feature: Choose Deal type
    # Similar to "beforeEach"
    Background:
      Given I navigate to the Deals home page
      And I navigate to the All Deals page

    # A scenario, that describes the Feature in more detail
    # (Scenario can also be called Example)
    Scenario: Read about deal types
      # Test body
      # Other Keywords: Given, When, And, But, * (star)
      Then I can read about the deal types

    Scenario: Choose deal types
```
  - [List of Gherkin keywords](https://cucumber.io/docs/gherkin/reference/#keywords)
3. Write corresponding Cypress test with file convention `.e2e.ts`
  - Eg. `Given("I open a Deal", () => { /* test body */ })`, where in the test body you write Cypress test code, typically
```ts
// Select the dom part in question
// Here: Click on Open Proposal button
cy.get("[data-test='open-proposal-button']").click()

// Run assertion
// Here: Because we clicked on a button, there is a change in the url
cy.url().should("include", "deals/open");
```

### Tags
- `@focus` - only run focused Scenario in .feature file
- `@regression` - Indicate Scenario is to cover a regression in the code

### Tooling
- [VSCode Cucumber Autocomplete Extension](https://github.com/alexkrechik/VSCucumberAutoComplete#settings-example)

### Configuration
https://docs.cypress.io/guides/references/configuration#cypress-json

[gherkin]: (https://cucumber.io/docs/gherkin/)
