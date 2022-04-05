Feature: "Proposal" stage (Stage 1)

  Background:
    Given I navigate to the "Open proposal" "Proposal" stage

  Scenario: Go back to deal type select
    When I go to previous step
    Then I am presented the option to choose a partner

  Scenario: Wizard stepper contains correct stages
    Then I can see stages correct for open proposal

  Scenario: Validates required fields
    When I try to proceed to next step
    Then I am presented with the "Open proposal" "Proposal" stage
    And I am presented with the "Title is required" error message for the "Proposal Title" field
    And I am presented with the "Summary is required" error message for the "Proposal Summary" field
    And I am presented with the "Description is required" error message for the "Proposal Description" field

  Scenario: Validates summary and description being too short
    Given I want to fill in information for the "Proposal" section
    When I fill in the "Proposal Summary" field with "short"
    And I fill in the "Proposal Description" field with "short"
    And I try to proceed to next step
    Then I am presented with the "Open proposal" "Proposal" stage
    And I am presented with the "Summary must be at least 10 characters" error message for the "Proposal Summary" field
    And I am presented with the "Description must be at least 10 characters" error message for the "Proposal Description" field

  Scenario: I proceed from proposal stage after filling required fields correctly
    Given I want to fill in information for the "Proposal" section
    When I fill in the "Proposal Title" field with "title"
    And I fill in the "Proposal Summary" field with "some summary"
    And I fill in the "Proposal Description" field with "some description"
    And I try to proceed to next step
    Then I am presented with the "Open proposal" "Lead Details" stage

  Scenario: I can navigate the stages freely using stepper
    Given I am presented with the "Open proposal" "Proposal" stage
    When I try to navigate to the "Lead Details" stage via stepper
    Then I am presented with the "Open proposal" "Lead Details" stage
    When I try to navigate to the "Proposal" stage via stepper
    Then I am presented with the "Open proposal" "Proposal" stage
    When I try to navigate to the "Primary DAO" stage via stepper
    Then I am presented with the "Open proposal" "Primary DAO" stage

