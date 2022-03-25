Feature: Discussions - Single Comment
  Background:
    Given I'm viewing a public Deal
    And I connect to the wallet with address "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"
    And I choose a single Topic with replies

  # Scenario: Single comments - Create
  #   - only enable comment button when there is text
  # Scenario: Single comments - Create (disabled)
  # Scenario: Single comments - Activity

  Scenario: Single comments - Like
    When I view a single Comment
    Then I can like that Comment

  # Scenario: Single comments - Like - Cannot like own comment
  # Scenario: Single comments - Like - Disables other buttons
  # Scenario: Single comments - Dislike

  # Scenario: Single comments - Delete - After refresh
  # Scenario: Single comments - Delete - Immediately
  # Scenario: Single comments - Delete - Replied to
  # Scenario: Single comments - Delete - Only mine

  Scenario: Single comments - Reply
    When I view a single Comment
    Then I can reply to that Comment
    And I can see who I am replying to
    And I can cancel replying that Comment again

  # TODO: This scenario is covered by "Scenario: Single comments - Reply"
  #   But should have it's own test.
  #   Currently, it's not separate, because fetching Comments testing takes too long
  # Scenario: Single comments - Reply - Close/Cancel reply

  # TODO: Low priority
  # Scenario: Single comments - Reply (disabled)

