# *WIP*

## Concepts:
- [Cypress](https://docs.cypress.io/guides/overview/why-cypress)
- [BDD](https://cucumber.io/docs/bdd/)
  - [Gherkin][gherkin]
  - [Cucumber](https://cucumber.io/docs/cucumber/?sbsearch=Cucumber) - Implementation of BDD in code
    - [cypress-cucumber-preprocessor](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor)
      - [the fork we are using](https://github.com/badeball/cypress-cucumber-preprocessor)
- [Page Objects](https://applitools.com/blog/page-objects-app-actions-cypress/)

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

### Debugging
Weakness of Cypress tests (e2e tests in general), are there risks for flaky test runs ([Flaky Test Management](https://docs.cypress.io/guides/dashboard/flaky-test-management)).
Some debugging approaches:

1. Screenshots: Failed tests will create screenshots in `/cypress/screenshots`
2. Videos: `cypress.json` -> `video: true` (currently disabled)
3. Run single tests repeatedly (either in gui or in cli via `npx cypress run --spec <relative_path_from_root or glob>`)
4. Follow Cypress [best practices](https://docs.cypress.io/guides/references/best-practices)
5. Disable test and add a comment or a tag `@flaky`

### Page Objects
While Page Objects are regarded as an [anti-pattern](https://docs.cypress.io/guides/references/best-practices#Organizing-Tests-Logging-In-Controlling-State), they are
seen as a way to reduce code, and to to "control the page".
In the long run, we would like to migrate to [App Actions](app_action) or the [Screenplay Pattern](https://www.infoq.com/articles/Beyond-Page-Objects-Test-Automation-Serenity-Screenplay/), but meanwhile we have Page Objects.

(Alternative could be to use [Cypress Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands))

The main idea is to use a Single State Object, that saves information a user would also have:
- The current wallet address
- The deal title, that was just created
- More complex: 2 users - 1 Proposal Lead - 1 Representative

#### Usage
Our Single State Objects are static classes like:
- E2eWallet
- E2eDealsApi (more in this [section](#e2eDealsApi))
- E2EDashboard

A simple flow could look likes this
```ts
// 1. Setup
E2eWallet.currentWalletAddress = <myAddress>;
E2eDeals.currentDeal = <myDeal>;

// 2. Use Api to get Deal for specific account
E2eDealsApi.getFirstOpenProposalId({isLead: true})

// 3. Interact with application (works, because we are connected and authenticated )
E2EDashboard.editDeal();
```

#### Drawbacks
Cypress shines through it's well thought out chaining API, so introducing yet another layer will void that strength.
However, if we aim to use Page Objects, for just as a tool to reduce code duplication, we could have a nice balance.

Note (!): Only because some code uses Page Objects, does not have to mean, everything has to.
We should always write code in the best maintainable way!

### E2eDealsApi
Through internal code ([App Actions](app_action)), we can access, eg. Firebase and use its API, to fetch or create Deals.

### Tags
- `@focus` - only run focused Scenario in .feature file
- `@regression` - Indicate Scenario is to cover a regression in the code
- `@user_journey` - Larger in scope than usual Scenarios. Captures the "user journey" to achieve more complex interactions
- `@flaky` - indicate underlying test is flaky (eg. unstable - sometimes green, sometimes red)

### Tooling
- [VSCode Cucumber Autocomplete Extension](https://github.com/alexkrechik/VSCucumberAutoComplete#settings-example)

### Configuration
https://docs.cypress.io/guides/references/configuration#cypress-json

[gherkin]: (https://cucumber.io/docs/gherkin/)
[app_action]: (https://www.cypress.io/blog/2019/01/03/stop-using-page-objects-and-start-using-app-actions/)
