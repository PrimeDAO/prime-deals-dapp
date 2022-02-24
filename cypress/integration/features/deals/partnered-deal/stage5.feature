Feature: "Token Details" stage (Stage 5)

  Background:
    Given I navigate to the "Partnered Deal" "Token Details" stage

  Scenario: Validates required fields
    When I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Address is required" error message for the "Token address" field
    And I am presented with the "Amount is required" error message for the "Token amount" field
    And I am presented with the "Execution period is required" error message for the "Execution Period" field


  Scenario: Validates vesting fields
    When I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Address is required" error message for the "Token address" field
    And I am presented with the "Amount is required" error message for the "Token amount" field
    And I am presented with the "Execution period is required" error message for the "Execution Period" field

  Scenario: Validates if the wallet address has the correct format
    When I fill in the "Token address" field with "wrong address" in the "Primary DAO tokens" section
    And I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Please enter a valid ethereum address" error message for the "Token address" field

  Scenario: Validates vesting periods
    When I fill in the "Token amount" field with "123" in the "Primary DAO tokens" section
    And I try to proceed to next step
    Then I am presented with the "Partnered Deal" "Token Details" stage
    And I am presented with the "Please provide a vesting period" error message for the "Vested Period" field
    And I am presented with the "Please provide a cliff period" error message for the "Cliff Period" field


#  This scenario needs the next stage in order to be tested. (replace "<Next stage>" with the proper next stage name)
#  Scenario: I proceed from the "Token Details" stage after filling required fields correctly
#    When I fill in the "Token address" field with "0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad"
#    And I fill in the "Token amount" field with "123"
#    And I fill in the "Vested Period" field with "123"
#    And I fill in the "Cliff Period" field with "123"
#    And I fill in the "Execution Period" field with "123"
#    And I try to proceed to next step
#    Then I am presented with the "Partnered Deal" "<Next stage>" stage
