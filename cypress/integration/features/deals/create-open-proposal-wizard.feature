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

  
  ###################
  # Primary DAO stage
  ###################

  Scenario: Primary DAO stage allows to add information about DAO and its representatives
    Given I navigate create open proposal wizard Primary DAO stage
    Then I can see Primary DAO section with inputs for collecting its details
    And I can see Primary DAO Representatives section

  Scenario: Try to proceed from Primary DAO stage without filling the required fields
    Given I navigate create open proposal wizard Primary DAO stage
    And I try to proceed to next step
    Then I am presented with errors for DAO details fields

  Scenario: Add Primary DAO avatar link
    Given I navigate create open proposal wizard Primary DAO stage
    Then I can add link to DAO avatar

  Scenario: Add and remove social media fields in Primary DAO stage
    Given I navigate create open proposal wizard Primary DAO stage
    Then I can add up to 5 social media
    Then I can remove all social media

  Scenario: Try to proceed from Primary DAO stage after filling the required DAO details fields
    Given I navigate create open proposal wizard Primary DAO stage
    When I fill in DAO details
    And I try to proceed to next step
    Then No errors for DAO details fields are visible

  Scenario: Add and remove DAO representatives
    Given I navigate create open proposal wizard Primary DAO stage
    Then I can add up to 5 DAO representatives
    Then I can remove all but one DAO representative

  Scenario: Try to proceed from Primary DAO stage without adding any representatives
    Given I navigate create open proposal wizard Primary DAO stage
    And I try to proceed to next step
    Then I am presented with error about missing representative address

  Scenario: Try to proceed from Primary DAO stage after adding incorrect representative address
    Given I navigate create open proposal wizard Primary DAO stage
    When I add 2 incorrect representative addresses
    And I try to proceed to next step
    Then I am presented with errors about incorrect representative addresses
