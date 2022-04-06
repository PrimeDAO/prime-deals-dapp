Feature: "Token Details" stage (Stage 5) - Open Proposal
  Background:
    Given I navigate to the "Open proposal" "Token Details" stage

  #####################################################

  # Need to add for "Edit Open proposal case too?"
  Scenario: Token Details - Optional
    Then I can proceed to the next step

  #####################################################

  Scenario: Proceeding to the next stage - only Token Details
    Given I want to fill in information for the "Tokens" section
    And I add a Token Details form
    When I fill in the "Token address" field with "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad"
    And I wait until the Token has loaded
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
