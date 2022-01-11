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

### Flow
1. Single out a Specification, that you want to cover with automated tests
2. Define the Specifications in [Gherkin][gherkin] format in `.feature` files
3. Write corresponding Cypress test with file convention `.e2e.ts`

### Tooling
- [VSCode Cucumber Autocomplete Extension](https://github.com/alexkrechik/VSCucumberAutoComplete#settings-example)

[gherkin]: (https://cucumber.io/docs/gherkin/)