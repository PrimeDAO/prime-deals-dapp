Feature: "Lead details" stage (Stage 2)

  Background:
    Given I'm the Proposal Lead of an Open Proposal
    Given I navigate to the "Make an offer" "Lead Details" stage

  @focus
  Scenario: Proposal Lead - Disable, when Primary DAO keeps Admin rights
    Given I want to fill in information for the "Proposal Lead" section
    Then the "Proposal Lead Address" field should be disabled
    And the "Contact Email" field should be disabled
