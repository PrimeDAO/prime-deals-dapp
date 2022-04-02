Feature: Discussions - Wallet
  Background:
    Given I'm an Anonymous user
    And I'm viewing an Open Proposal

  @focus
  Scenario: Wallet - Disconnected - Deal Clauses
    Then I cannot begin a Discussion

  Scenario: Wallet - Disconnected - Threads
    Then I'm informed about who can participate in Discussions

  Scenario: Wallet - Disconnected - Single Comments - Add Comment
    When I choose a single Topic without replies
    Then I cannot add a Comment

  Scenario: Wallet - Disconnected - Single Comments - Comment actions
    When I choose a single Topic with replies
    Then I cannot add a Comment
    And I cannot reply to a Comment
    # And I cannot dislike a Comment
  #   - no vote, comment, reply, (dis)like
