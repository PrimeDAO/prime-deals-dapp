Feature: Discussions - Privacy
  Background:
    Given I'm the Proposal Lead of an Open Proposal
    And I'm viewing a private Deal

  Scenario: Privacy - Public Viewer - No interaction
    Given I'm a "Connected Public" user
    Then I should not be able to see Discussions
    # ^ Note: Actually, should not be able to access deal dashboard at all, but for now at least have this test

  # Scenario: Privacy - Private - Private comment not visible
