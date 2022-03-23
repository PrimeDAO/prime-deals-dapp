Feature: Discussions - Wallet
  Background:
    Given I navigate to the Deals home page

  @focus
  Scenario: Privacy - Public Viewer - No interaction
    Given I'm a Public viewer
    When I'm viewing a private Deal
    Then I should not be able to see Discussions
    # ^ Note: Actually, should not be able to access deal dashboard at all, but for now at least have this test

  # Scenario: Privacy - Private - Private comment not visible
