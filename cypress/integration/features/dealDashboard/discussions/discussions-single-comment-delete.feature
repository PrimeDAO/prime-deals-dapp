Feature: Discussions - Single Comment - Delete

  # Note that this Scenario assumes
  # 2 comments: First one normal, second one replay to first one
  Scenario: Single comments - Delete comment with Reply
    Given I mock the Discussions Provider
    Given I'm the Proposal Lead of an Open Proposal
    # And the Open Proposal has Discussions with replies
    And I'm viewing the Open Proposal
    And I choose a single Topic with replies
    When I delete my Comment, that has a reply
    Then the reply Comment should show, that the original message was deleted

  @regression
  Scenario: Single comments - Delete two comments after one another
    Given I mock the Discussions Provider
    Given I'm the Proposal Lead of an Open Proposal
    # And the Open Proposal has Discussions with replies
    And I'm viewing the Open Proposal
    And I choose a single Topic with replies
    When I add a new Comment
    # And I delete my Comment
    # And I delete my Comment
    # Then 2 comment should be in the Thread

  @regression
  @focus
  Scenario: Single comments - Reply to comment, that was meanwhile deleted
    Given I mock the Discussions Provider
    Given I'm the Proposal Lead of an Open Proposal
    # And the Open Proposal has Discussions with replies
    And I'm viewing the Open Proposal
    And I choose a single Topic with replies
    When a comment was deleted meanwhile
    And I like that Comment
    Then an error should occur reading "This comment has been deleted by the author"
