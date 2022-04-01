Feature: Create Open Proposal
  Background:
    Given I navigate to the "Open proposal" "Proposal" stage
    And I'm a Connected Public user

  @user_journey
  Scenario: Create Open Proposal
    Given I fill out the Proposal Stage
    And I can proceed to the next step
    And I fill out the Lead Details Stage
    And I can proceed to the next step
    And I fill out the Primary DAO Stage
    And I can proceed to the next step
    # Token Details is optional, so we can proceed
    And I can proceed to the next step
    And I fill out the Terms Stage
    And I can proceed to the next step
    When I try to submit the registration data
    Then I should be notified, that the registration was successful
    And the newly created Deal is displayed on the landing page
