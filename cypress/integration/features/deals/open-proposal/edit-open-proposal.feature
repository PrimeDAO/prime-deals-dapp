Feature: Edit an Open Propsoal
  Background:
    Given I'm the Proposal Lead of an Open Proposal
    And I'm viewing the Open Proposal

  Scenario: Edit an Open Proposal
    Given I edit the Open Proposal
    And I want to fill in information for the "Proposal" section
    When I clear the "Proposal Title" field
    And I fill in the "Proposal Title" field with "e2e_changed_text"
    And I use the stepper to go to the "Terms" step
    And I try to proceed to next step
    And I try to submit the registration data

