Feature: Create Open Proposal Primary DAO stage

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