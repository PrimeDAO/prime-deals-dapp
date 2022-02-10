Feature: Create Open Proposal
  Background:
    Given I navigate create open proposal wizard
    
  Scenario: Go back to deal type select
    Given I am presented with Open Proposal proposal stage
    When I go to previous step
    Then I am presented the option to choose a partner

  Scenario: I proceed from proposal stage without filling in required fields
    When I try to proceed to next step
    Then I am presented with Open Proposal proposal stage
    And I am presented with errors proposal stage required errors

  Scenario: I proceed from proposal stage after filling required fields with too short summary and description
    When I fill in proposal title correctly
    And I fill in proposal summary with text that is too short
    And I fill in proposal description with text that is too short
    And I try to proceed to next step
    Then I am presented with Open Proposal proposal stage
    And I am presented with too short input errors for proposal summary and description

  Scenario: I proceed from proposal stage after filling required fields correctly
    When I fill in proposal title correctly
    And I fill in proposal summary with text that meets requirements
    And I fill in proposal description with text that meets requirements
    And I try to proceed to next step
    Then I am presented with Open Proposal proposal lead stage

  Scenario: Wizard stepper contains correct stages
    Then I can see stages correct for open proposal

  Scenario: I can navigate the stages freely using stepper
    Given I am presented with Open Proposal proposal stage
    When I try to navigate to proposal lead stage via stepper
    Then I am presented with Open Proposal proposal lead stage
    When I try to navigate to primary dao stage via stepper
    Then I am presented with Open Proposal primary dao stage
    When I try to navigate to proposal lead stage via stepper
    Then I am presented with Open Proposal proposal lead stage
    When I try to navigate to proposal stage via stepper
    Then I am presented with Open Proposal proposal stage
    When I try to navigate to primary dao stage via stepper
    Then I am presented with Open Proposal primary dao stage
    When I try to navigate to proposal stage via stepper
    When I am presented with Open Proposal proposal stage