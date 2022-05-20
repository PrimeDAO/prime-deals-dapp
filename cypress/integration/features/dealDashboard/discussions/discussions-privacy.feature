Feature: Discussions - Privacy
  Background:
    Given I'm the Proposal Lead of a new Open Proposal

  Scenario: Privacy - Public Viewer - No interaction
    Given I'm a "Connected Public" user
    And I'm viewing that deal
    Then I should not be able to see Discussions
    # ^ Note: Actually, should not be able to access deal dashboard at all, but for now at least have this test

  # Scenario: Privacy - Private - Private comment not visible
