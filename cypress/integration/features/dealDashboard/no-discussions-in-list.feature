Feature: Deal Dashboard Discussions Section
  # As a user
  # I want to see a message saying that there are no discussions made
  # on the deal dashboard, so that I will know that there are no discussions
  # going on yet.

  Background:
    Given I'm the Proposal Lead of an Open Proposal
    And I'm viewing the Open Proposal
    And No thread is created for this deal

  Scenario: No thread is created for this deal
    Then I should see a no discussions for deal message
