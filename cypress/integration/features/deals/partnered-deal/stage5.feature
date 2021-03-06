Feature: "Token Details" stage (Stage 5)
  Background:
    Given I'm the Proposal Lead of a Partnered Deal
    Given I navigate to the "Partnered Deal" "Token Details" stage

  #####################################################

  Scenario Outline: Add a default empty form, when there is no Token
    Given I navigate to the "<WizardType>" "Token Details" stage
    Then I am presented with an empty Token Details form

    Examples:
      | WizardType     |
      | Partnered Deal |
      | Make an offer  |

  # Scenario: Token Details - Address
  # Scenario: Token Details - Amount
  # Scenario: Token Details - Instant Transfer Set up
  # Scenario: Token Details - Vesting Set up

  # Scenario: Add Token

  Scenario: No Delete, when there is only one Token form
    Given I want to fill in information for the "Primary DAO Tokens" section
    And I have 1 Token Details form
    Then I cannot delete a Token Details form

  Scenario: Delete Token
    Given I want to fill in information for the "Primary DAO Tokens" section
    And I have 2 Token Details forms
    Then I can delete a Token Details form

  Scenario: Save Token
    Given I want to fill in information for the "Primary DAO Tokens" section
    And I have 1 Token Details form
    When I try to save the Token Details form
    And I am presented with the "Address is required" error message for the "Token address" field
    And the Token Details form was not saved

  #####################################################

  # Scenario: Partner DAO

  #####################################################

  # Scenario: Funding Period

  #####################################################

  Scenario: Validates required fields - Proceeding
    When I try to proceed to next step
    Then I am notified, that I am unable to proceed due to validation errors
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Address is required" error message for the "Token address" field
    And I am presented with the "Funding Period is required" error message for the "Funding Period" field

  Scenario: Validates if the wallet address has the correct format
    Given I want to fill in information for the "Primary DAO Tokens" section
    When I fill in the "Token address" field with an invalid address "invalid address"
    And I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Please enter a valid ethereum address" error message for the "Token address" field
