Feature: Create Partnered Deal
  Background:
    Given I navigate to the "Partnered Deal" "Proposal" stage
    And I'm a "Connected Public" user

  Rule: Representative cannot be part of more than 1 DAO
    Scenario: DAO stages - Error when adding Representative to more than 1 DAO
      Given I use the stepper to go to the "Primary DAO" step
      And I want to fill in information for the "Select Representatives" section
      And I fill in the "DAO Representatives Addresses" field with "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"
      Given I use the stepper to go to the "Partner DAO" step
      And I want to fill in information for the "Select Representatives" section
      And I fill in the "DAO Representatives Addresses" field with "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"
      Then I should be alerted, that a Representative can only be part of one DAO
