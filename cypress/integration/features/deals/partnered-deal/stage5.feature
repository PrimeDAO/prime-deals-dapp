Feature: "Token Details" stage (Stage 5)
  Background:
    Given I navigate to the "Partnered Deal" "Token Details" stage

  #####################################################

  Scenario Outline: Add a default empty form, when there is no Token
    Given I navigate to the "<WizardType>" "Token Details" stage
    Then I am presented with an empty Token Details form

    Examples:
      | WizardType     |
      | Partnered Deal |
      | Make an offer  |


  Scenario: Token Details - Address
  Scenario: Token Details - Amount
  Scenario: Token Details - Instant Transfer Set up
  Scenario: Token Details - Vesting Set up

  Scenario: Add Token

  Scenario: No Delete, when there is only one Token form
    Given I have 1 Token Details form for the "Primary DAO Tokens"
    Then I cannot delete a Token Details form

  Scenario: Delete Token
    Given I have 2 Token Details forms for the "Primary DAO Tokens"
    Then I can delete a Token Details form

  Scenario: Save Token
    Given I have 1 Token Details form for the "Primary DAO Tokens"
    When I try to save the Token Details form for the "Primary DAO Tokens"
    And I am presented with the "Address is required" error message for the "Token address" field
    And I am presented with the "Amount is required" error message for the "Token amount" field
    And the Token Details form was not saved for the "Primary DAO Tokens"

  #####################################################

  Scenario: Partner DAO

  #####################################################

  Scenario: Execution Period

  #####################################################

  Scenario: Validates required fields
    When I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Address is required" error message for the "Token address" field
    And I am presented with the "Amount is required" error message for the "Token amount" field
    And I am presented with the "Execution period is required" error message for the "Execution Period" field


  Scenario: Validates vesting fields
    When I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Address is required" error message for the "Token address" field
    And I am presented with the "Amount is required" error message for the "Token amount" field
    And I am presented with the "Execution period is required" error message for the "Execution Period" field

  Scenario: Validates if the wallet address has the correct format
    When I fill in the "Token address" field with "wrong address" in the "Primary DAO tokens" section
    And I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Please enter a valid ethereum address" error message for the "Token address" field

  Scenario: Validates vesting periods
    When I fill in the "Token amount" field with "123" in the "Primary DAO tokens" section
    And I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Please provide a vesting period" error message for the "Vested Period" field
    And I am presented with the "Please provide a cliff period" error message for the "Cliff Period" field

  Scenario: Validation - Proceeding when unsaved data

