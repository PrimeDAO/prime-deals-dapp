Feature: Make an offer
  Background:
    Given I navigate to make an offer wizard

  ###################
  # Primary DAO stage
  ###################

  Scenario: All Primary DAO information is visible and disabled
    Given I navigate to make an offer Primary DAO stage
    Then I can see DAO details section with pre-filled disabled fields
    And I can see DAO representatives section with pre-filled disabled fields


