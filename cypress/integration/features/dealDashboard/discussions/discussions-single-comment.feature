Feature: Discussions - Single Comment
  Background:
    Given I'm viewing a public Deal
    And I connect to the wallet with address "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"

  # Scenario: Single comments - Create
  #   - only enable comment button when there is text

  # Scenario: Single comments - Create (disabled)
  # Scenario: Single comments - Activity

  # Scenario: Single comments - Like
  # Scenario: Single comments - Like - Cannot like own comment
  # Scenario: Single comments - Like - Disables other buttons
  # Scenario: Single comments - Dislike

  # Scenario: Single comments - Delete - After refresh
  # Scenario: Single comments - Delete - Immediately
  # Scenario: Single comments - Delete - Replied to
  # Scenario: Single comments - Delete - Only mine

  @focus
  Scenario: Single comments - Reply
    When I choose a Single Comment with replies
    Then I can reply to that Comment

  # Scenario: Single comments - Reply - to every comment
  # Scenario: Single comments - Reply (disabled)
  # Scenario: Single comments - Reply - Close/Cancel reply
