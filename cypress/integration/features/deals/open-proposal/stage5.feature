Feature: "Token Details" stage (Stage 5) - Open Proposal
  Background:
    Given I navigate to the "Open proposal" "Token Details" stage

  #####################################################

  # Need to add for "Edit Open proposal case too?"
  Scenario: Token Details - Optional
    Then I can proceed to the next step

  Scenario: Proceeding to the next stage - only Token Details
    Given I want to fill in information for the "Tokens" section
    Given I add a Token Details form
    When I fill in the "Token address" field with "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad"
    And I fill in the "Token amount" field with "123"
    And I fill in the "Vested Period" field with "123"
    And I fill in the "Cliff Period" field with "123"
    And I try to save the Token Details form
    Then I can proceed to the next step

  Scenario: Proceeding to the next stage - only Execution Period
    Given I want to fill in information for the "Execution Period" section
    And I fill in the "Execution Period" field with "123"
    Then I can proceed to the next step

  #####################################################

  @internal
  Scenario: Token Details - Token amount disabled if no Token address provided - Remove address again
    Given I want to fill in information for the "Tokens" section
    And I add a Token Details form
    When I fill in the "Token address" field with "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad"
    Then the "Token amount" field should not be disabled

    When I clear the "Token address" field
    Then the "Token amount" field should be disabled
