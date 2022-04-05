Feature: "Lead details" stage (Stage 2)

  Background:
    Given I navigate to the "Partnered Deal" "Lead Details" stage

  Scenario: Private Deal option should be turned off by default
    When I'm in the "Make this Deal Private?" section
    Then the "Make Deal Private" option should be turned off

