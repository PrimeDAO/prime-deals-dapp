Feature: Discussions - Single Comment - Delete
  @focus
  Scenario: Single comments - Delete - Immediately
    Given I'm the Proposal Lead of an Open Proposal
    # And the Open Proposal has Discussions with replies
    And I'm viewing the Open Proposal
    And I choose a single Topic with replies

