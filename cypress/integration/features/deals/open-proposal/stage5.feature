Feature: "Token Details" stage (Stage 5) - Open Proposal
  Background:
    Given I navigate to the "Open proposal" "Token Details" stage

  #####################################################

  # Need to add for "Edit Open proposal case too?"
  Scenario: Token Details - Optional
    Then I can proceed to the next step

  #####################################################

  @regression
  Scenario: Token Details - Incorrect Address and navigation
    Given I want to fill in information for the "Tokens" section
    And I add a Token Details form
    When I fill in the "Token address" field with an invalid address "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"
    And I am presented with the "Please enter a valid IERC20 address" error message for the "Token address" field
    And I go to previous step
    And I use the stepper to go to the "Token Details" step
    Then I should not be presented with the Token Details metadata

  #####################################################

  Scenario: Proceeding to the next stage - only Token Details
    Given I want to fill in information for the "Tokens" section
    And I add a Token Details form
    When I fill in the "Token address" field with "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad"
    And I fill in the "Token amount" field with "123"
    And I fill in the "Vested Period" field with "123"
    And I fill in the "Cliff Period" field with "123"
    And I try to save the Token Details form
    Then I can proceed to the next step

  Scenario: Proceeding to the next stage - only Funding Period
    Given I want to fill in information for the "Funding Period" section
    And I fill in the "Funding Period" field with "123"
    Then I can proceed to the next step

  #####################################################

  # TODO: Three below: Find token where amount is 0, else cannot change decimals in UI
  @internal
  Scenario: Token Details - Decimals - Clearing should default to 0
  @internal
  Scenario: Token Details - Decimals - Min 0
  @internal
  Scenario: Token Details - Decimals - Max 18

  @internal
  Scenario: Token Details - Token amount disabled if no Token address provided - Remove address again
    Given I want to fill in information for the "Tokens" section
    And I add a Token Details form
    When I fill in the "Token address" field with "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad"
    Then the "Token amount" field should not be disabled

    When I clear the "Token address" field
    Then the "Token amount" field should be disabled
