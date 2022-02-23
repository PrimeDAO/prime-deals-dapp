Feature: Choose Deal type
  Background:
    Given I navigate to the Deals home page
    And I navigate to the initiate a deal page

  Scenario: View deal types
    Then I can see Token Swap deal type
    And I can see Co-liquidity deal type

  Scenario: Access Token Swap
    When I select Token Swap
    Then I am presented the option to choose a partner

  Scenario: Verify correct Token Swap types
    Given I select Token Swap
    Then I can see Open Proposal and Partnered Deal

  Scenario: Select Open Proposal
    Given I select Token Swap
    And I select Open Proposal
    Then I can view the Open Proposal wizard

  Scenario: Select Partnered Deal
    Given I select Token Swap
    And I select Partnered Deal
    Then I can view the Partnered Deal wizard
