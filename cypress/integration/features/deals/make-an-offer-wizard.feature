Feature: Make an offer
  ###################
  # Primary DAO stage
  ###################
  Scenario: All Primary DAO information is visible and disabled - Connected
    Given I'm the Proposal Lead of an Open Proposal
    And I navigate to make an offer wizard
    When I use the stepper to go to the "Primary DAO" step
    Then I can see DAO details section with pre-filled disabled fields
    And I can see DAO representatives section with pre-filled disabled fields

  Scenario: All Primary DAO information is visible and disabled - Disconnected
    Given I'm an "Anonymous" user
    And I navigate to make an offer wizard
    When I use the stepper to go to the "Lead Details" step
    And I want to fill in information for the "Proposal Lead" section
    Then the "Proposal Lead Address" field should be disabled
    And I cannot connect to get my wallet address



