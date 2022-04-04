Feature: Terms - Make an offer
  Background:
    Given I'm the Proposal Lead of an Open Proposal
    And I navigate to the "Make an offer" "Terms" stage

  Scenario: View existing Clauses
    Then I can see my existing Clauses
