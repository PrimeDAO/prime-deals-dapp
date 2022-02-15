Feature: "Lead details" stage (Stage 2)

  Background:
    Given I navigate to the 'Open proposal' 'Lead Details' stage

  Scenario: Validates required fields
    When I try to proceed to next step
    Then I am presented with the 'Open proposal' 'Lead Details' stage
    And I am presented with the 'Wallet address is required' error message for the 'Wallet address' field

  Scenario: Validates if the wallet address has the correct format
    When I fill in the 'Wallet address' field with 'wrong address'
    And I try to proceed to next step
    Then I am presented with the 'Open proposal' 'Lead Details' stage
    And I am presented with the 'Please enter a valid wallet address' error message for the 'Wallet address' field

  Scenario: Validates if the email address has the correct format
    When I fill in the 'Email' field with 'wrong email'
    And I try to proceed to next step
    Then I am presented with the 'Open proposal' 'Lead Details' stage
    And I am presented with the 'Please enter a valid email address' error message for the 'Email' field

  Scenario: I proceed from the 'Lead Details' stage after filling required fields correctly
    When I fill in the 'Wallet address' field with '0x0DA7fB6eeDdBcc5A5EBe388783aD5cA99a556677'
    And I try to proceed to next step
    Then I am presented with the 'Open proposal' 'Primary DAO' stage

  Scenario: Private Offers option should be turned off by default
    When I'm in the "Make Offers Private?" section
    Then the "Make Offers Private" option should be turned off
