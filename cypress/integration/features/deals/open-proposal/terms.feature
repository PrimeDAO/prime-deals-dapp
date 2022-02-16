Feature: Terms
  Background:
    Given I navigate to the "Open proposal" "Terms" stage

  Scenario: View Terms stage
    Then I can view the Terms stage

  Scenario: Create a Clause
    Given I add content to a Clause
    When I save the changes
    Then the new Clause should appear

  Scenario: Deleting a Clause
    Given I have 2 Clauses
    When I delete the latest Clause
    Then I should only have 1 Clause

  Rule: Maximum 10 Clauses
    Scenario: 9 Clauses present
      Given I have 9 Clauses
      When I add a Clause
      Then I am not able to add another Clause

    Scenario: 10 Clauses present
      Given I have 10 Clauses
      Then I am not able to add another Clause
