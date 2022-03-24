Feature: Submit Stage - Open Deal (Partnered Deal)
  Scenario: View registration data
    # Then all the wizard registration data should be presented

  Scenario: Prevent navigation - Direct navigation
    Given I navigate to the "Partnered Deal" Submit stage
    Then I should be redirected to the Home Page

  Scenario: Prevent navigation - Invalid previous stages
    Given I navigate to the "Partnered Deal" "Terms" stage
    And I add content to a Clause
    And I save the changes to the Clause
    When I try to proceed to next step
    Then I should get an error notification
    # Then all the wizard registration data should be presented

  # Scenario: Submit registration data
  #   When I try to submit the registration data

  # Scenario: View registration data
  #   Given I successfully completed all previous stages
  #   When I'm in the Submit stage
  #   Then I can view all my input in the Submit stage

  # Scenario: Submit registration data - valid
  #   Given I successfully completed all previous stages
  #   When I try to submit the registration data
  #   Then I should be congratulated

  # Scenario: Submit registration data - invalid
  #   Given there are invalid previous stages
  #   When I try to submit the registration data
  #   Then I should be notified, that I have invalid inputs
  #   # And I'm notified which stages are invalid
