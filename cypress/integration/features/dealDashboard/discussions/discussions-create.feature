Feature: Discussions create
  @focus
  Scenario Outline: Creating a Discussion - No Discussions for Clause yet
    Given I'm a "<UserType>" user
    And I'm viewing a new public Open Proposal
    Then I should be informed of no discussions
    And I can create a new Discussion
    And I'm informed about, that the discussion has no comments yet

    Examples:
      | UserType         |
      | Connected Public |
      | Proposal Lead    |
      | Representative    |
      #   v Covered by discussions-wallet. TODO: how to organize/track?
      # | Anonymous        |


  Scenario: Creating a Discussion - Info text
    # This discussion has no comments yet
