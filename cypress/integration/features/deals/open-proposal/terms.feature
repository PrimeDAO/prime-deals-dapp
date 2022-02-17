Feature: Terms
  Background:
    Given I navigate to the "Open proposal" "Terms" stage

  Scenario: View Terms stage
    Then I can view the Terms stage

  Scenario: Add a new Clause
    When I add a Clause
    Then I have 2 Clauses

  Scenario: Update a Clause
    Given I add content to a Clause
    When I save the changes
    Then the new Clause should appear

  Scenario: Update a Clause - invalid
    When I save the changes
    Then I should get an error message

  Scenario: Deleting a Clause
    Given I have 2 existing Clauses
    When I delete the latest Clause
    Then I should only have 1 Clause

  Scenario: Proceeding with incomplete Clauses
    When I try to proceed to next step
    Then I should get an error message

  Rule: Maximum 10 Clauses
    Scenario: 9 Clauses present
      Given I have 9 existing Clauses
      When I add a Clause
      Then I am not able to add another Clause

    Scenario: 10 Clauses present
      Given I have 10 existing Clauses
      Then I am not able to add another Clause
