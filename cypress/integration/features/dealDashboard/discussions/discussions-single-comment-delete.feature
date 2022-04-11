Feature: Discussions - Single Comment - Delete

  # Note that this Scenario assumes
  # 2 comments: First one normal, second one replay to first one
  @focus
  Scenario: Single comments - Delete comment with Reply
    Given I'm the Proposal Lead of an Open Proposal
    # And the Open Proposal has Discussions with replies
    And I'm viewing the Open Proposal
    And I choose a single Topic with replies

    When I delete my Comment, that has a reply
    Then the reply Comment should show, that the original message was deleted

