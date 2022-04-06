Feature: Create Partnered Deal
  Background:
    Given I navigate to the "Partnered Deal" "Proposal" stage
    And I'm a "Connected Public" user

  @user_journey
  Scenario: Create Partnered Deal
    Given I want to create a basic Partnered Deal
    And I fill out the Proposal Stage
    And I can proceed to the next step
    And I fill out the Lead Details Stage
    And I can proceed to the next step
    And I fill out the Primary DAO Stage
    And I can proceed to the next step
    And I fill out the Partner DAO Stage
    And I can proceed to the next step
    # When I use the stepper to go to the "Token Details" step
    And I fill out the Token Details Stage
    And I can proceed to the next step
    And I fill out the Terms Stage
    And I can proceed to the next step
    When I try to submit the registration data
    Then I should be notified, that the registration was successful
    And the newly created Deal is displayed on the landing page

  Rule: Representative cannot be part of more than 1 DAO
    @focus
    Scenario: DAO stages - Error when adding Representative to more than 1 DAO
      Given I use the stepper to go to the "Primary DAO" step
      And I want to fill in information for the "Select Representatives" section
      And I fill in the "DAO Representatives Addresses" field with "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"
      Given I use the stepper to go to the "Partner DAO" step
      And I want to fill in information for the "Select Representatives" section
      And I fill in the "DAO Representatives Addresses" field with "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"
      Then I should be alerted, that a Representative can only be part of one DAO
