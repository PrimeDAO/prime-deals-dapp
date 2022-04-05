Feature: Discussions create
  Background:
    Given I'm a Connected Public user
    And I create an Open Proposal

  @focus
  Scenario: Creating a Discussion - No Discussions for Clause yet
    When I'm viewing the Open Proposal
    Then I should be informed of no discussions
    And I can create a new Discussion

  Scenario: Creating a Discussion - Info text
    # This discussion has no comments yet
