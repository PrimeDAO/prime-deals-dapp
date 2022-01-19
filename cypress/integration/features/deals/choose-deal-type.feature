Feature: Choose Deal type
  Background:
    Given I navigate to the Deals home page
    And I navigate to the initiate a deal page by clicking Initiate a Deal
    
  Scenario: I can see correct deal types
    Then I can see Token Swap deal type
    And I can see Joint Venture deal type

  Scenario: I can select Token Swap
    When I click select on Token Swap card
    Then I am redirected to Do you have a partner page

  Scenario: I can see correct Token Swap types
    Given I click select on Token Swap card
    Then I can see Open Proposal and Partnered Deal
    
  Scenario: I can see select Open Proposal
    Given I click select on Token Swap card
    And I click select Open Proposal
    Then I am redirected to Open Proposal wizard