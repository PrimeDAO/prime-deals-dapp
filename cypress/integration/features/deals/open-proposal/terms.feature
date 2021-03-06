Feature: Terms - Open Proposal
  Background:
    Given I navigate to the "Open proposal" "Terms" stage

  Scenario: View Terms stage
    Then I can view the Terms stage

  Scenario: Add a new Clause
    When I add a Clause
    Then I have 2 Clauses

  Scenario: Update a Clause
    Given I add content to a Clause
    When I save the changes to the Clause
    Then the new Clause should appear

  Scenario: Update a Clause - invalid
    When I save the changes to the Clause
    Then I should get an error message for the Clause

  Scenario: Update a Clause - No validation
    Given I have 2 existing Clauses
    When I add content to the first Clause
    And I save the changes to the Clause
    Then I should get not an error message for the Clause

  Scenario: Delete a Clause
    Given I have 2 existing Clauses
    When I delete the last Clause
    Then I should only have 1 Clause

  Scenario: Delete a Clause - No deletion for single Clause
    Given I have 1 existing Clause
    Then I cannot delete the Clause

  @regression
  Scenario: Delete a Clause - Correct view state
    Given I have 2 existing Clause
    When I add content to the first Clause
    And I save the changes to the first Clause
    And I add content to the last Clause
    And I save the changes to the last Clause
    When I edit the last Clause
    And I delete the last Clause
    Then the first Clause should be in View mode

  Scenario: Proceeding with incomplete Clauses
    When I try to proceed to next step
    Then I should get an error message for the Clause

  Scenario: Validation multiple clauses
    Given I have 2 existing Clauses
    When I try to proceed to next step
    Then I should get 3 errors for the Clauses

  Rule: Maximum 10 Clauses
    Scenario: 9 Clauses present
      Given I have 9 existing Clauses
      When I add a Clause
      Then I am not able to add another Clause

    Scenario: 10 Clauses present
      Given I have 10 existing Clauses
      Then I am not able to add another Clause
