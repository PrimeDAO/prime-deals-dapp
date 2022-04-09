Feature: Discussions create
  Background:
    Given I'm a Connected Public user
    And I create an Open Proposal

  Scenario Outline: Creating a Discussion - No Discussions for Clause yet
    Given I'm a "<UserType>" user
    And I'm viewing a new public Open Proposal
    Then I should be informed of no discussions
    And I can create a new Discussion
    And I should be informed, that the discussion has no comments yet

    Examples:
      | UserType         |
      | Connected Public |
      | Proposal Lead    |
      | Representative    |
      #   v Covered by discussions-wallet. TODO: how to organize/track?
      # | Anonymous        |


  Scenario: Creating a Discussion - Info text
    # This discussion has no comments yet

  Scenario: Creating a Discussion - 3rd party error
    Given I'm viewing the Open Proposal
    And the 3rd party Discussions service has an error
    When I can create a new Discussion
    Then I should be informed about the error
    When I reload the discussions
    Then I should be informed, that the discussion has no comments yet
