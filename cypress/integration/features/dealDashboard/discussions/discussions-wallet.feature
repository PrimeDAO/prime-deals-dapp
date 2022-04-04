Feature: Discussions - Wallet
  Background:
    Given I'm an "Anonymous" user
    And the Open Proposal has Discussions with replies
    And I'm viewing the Open Proposal

  Scenario: Wallet - Disconnected - Deal Clauses
    Then I cannot begin a Discussion

  Scenario: Wallet - Disconnected - Threads
    Then I'm informed about who can participate in Discussions

  Scenario: Wallet - Disconnected - Single Comments - Add Comment
    When I choose a single Topic with replies
    Then I cannot add a Comment
