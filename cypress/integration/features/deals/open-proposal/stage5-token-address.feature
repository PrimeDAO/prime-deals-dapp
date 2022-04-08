Feature: "Token Details" stage (Stage 5) - Token Address
  Background:
    Given I navigate to the "Open proposal" "Token Details" stage
    Given I want to fill in information for the "Tokens" section
    And I add a Token Details form

  @regression
  Scenario: Token Details - Incorrect Address and navigation
    When I fill in the "Token address" field with an invalid address "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"
    And I am presented with the "Please enter a valid IERC20 address" error message for the "Token address" field
    And I go to previous step
    And I use the stepper to go to the "Token Details" step
    Then I should not be presented with the Token Details metadata

  @regression
  Scenario: Token Details - Change Address and navigation
    #                                              v E2E_ADDRESSES.PrimaryDAOToken
    Given I fill in the "Token address" field with "0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad"
    And I wait until the Token has loaded
    When I change the "Token address" field by adding "x"
    And I am presented with the "Please enter a valid ethereum address" error message for the "Token address" field
    And I go to previous step
    And I use the stepper to go to the "Token Details" step
    Then I should not be presented with the Token Details metadata
