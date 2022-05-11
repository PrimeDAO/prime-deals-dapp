Feature: Partnered Deal - Description

  Scenario: Representative can see the vote buttons
    Given I'm viewing a new Partnered deal as a Representative
    Then I can view the "Accept deal vote button"
    And I can view the "Decline deal vote button"

  Scenario: Representative can vote
    Given I'm viewing a new Partnered deal as a Proposal Lead
    And I accept the deal
    Then I can view the "Accept deal vote button"
    Then I can view the "Decline deal vote button"
